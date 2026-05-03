import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const audioCache: Record<string, string> = {};

export async function generateLessonAudio(text: string, lang: string = 'en'): Promise<string | null> {
  const cacheKey = `${lang}:${text.substring(0, 100)}`;
  if (audioCache[cacheKey]) return audioCache[cacheKey];

  try {
    const promptPrefix = lang === 'bn' 
      ? "Read this in Bengali with a calm, deep, confident male tone: " 
      : (lang === 'hi' ? "Read this in Hindi with a calm, deep, confident male tone: " : "Read this in English with a calm, deep, confident male tone: ");
    
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `${promptPrefix}${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, 
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) audioCache[cacheKey] = base64Audio;
    return base64Audio || null;
  } catch (error) {
    console.error("TTS Generation Error:", error);
    return null;
  }
}

export async function getLessonAdvice(lessonTitle: string, userGoal: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: 'user',
          parts: [{ text: `You are SheMind Mentor. Based on the lesson "${lessonTitle}" and the user's goal "${userGoal}", provide one punchy, high-impact piece of advice that they can apply today. Keep it under 40 words. Be respectful and emotionally intelligent.` }]
        }
      ]
    });
    return response.text;
  } catch (error) {
    console.error("Advice Generation Error:", error);
    return null;
  }
}

let audioContext: AudioContext | null = null;

export async function playPCM(base64Data: string): Promise<AudioBufferSourceNode | null> {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    
    // Resume context if it was suspended (browser policy)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // The TTS model returns 16-bit PCM at 24kHz
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    const audioBuffer = audioContext.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
    return source;
  } catch (error) {
    console.error("PCM Playback Error:", error);
    return null;
  }
}

export async function chatWithMentor(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[], lang: string = 'en') {
  try {
    const promptPrefix = lang === 'bn' ? "Answer in Bengali. " : (lang === 'hi' ? "Answer in Hindi. " : "");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: [
        {
          role: 'user',
          parts: [{ text: "You are SheMind Mentor, a mature, emotionally intelligent male psychologist. Your tone is calm, deep, respectful. Keep text responses concise and supportive." }]
        },
        ...history.map(h => ({ role: h.role, parts: h.parts })),
        {
          role: 'user',
          parts: [{ text: promptPrefix + message }]
        }
      ]
    });

    return response.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having trouble connecting right now. Take a deep breath and I'll be back soon.";
  }
}
