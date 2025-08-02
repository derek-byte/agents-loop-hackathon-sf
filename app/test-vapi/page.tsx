"use client";

import { useState, useEffect } from "react";
import Vapi from "@vapi-ai/web";

export default function TestVAPIPage() {
  const [vapi, setVapi] = useState<any>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toISOString().substr(11, 8)} - ${message}`]);
  };

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!publicKey) {
      addLog('❌ No VAPI public key found');
      return;
    }

    addLog(`✅ Initializing VAPI with key: ${publicKey.substring(0, 10)}...`);
    
    try {
      const vapiInstance = new Vapi(publicKey);
      
      vapiInstance.on('call-start', () => {
        addLog('📞 Call started');
        setIsCallActive(true);
      });

      vapiInstance.on('call-end', () => {
        addLog('📞 Call ended');
        setIsCallActive(false);
      });

      vapiInstance.on('error', (error: any) => {
        addLog(`❌ Error: ${JSON.stringify(error)}`);
      });

      vapiInstance.on('message', (message: any) => {
        addLog(`📨 Message: ${message.type}`);
      });
      
      // Add connection state listeners
      vapiInstance.on('connection-state-change', (state: any) => {
        addLog(`🔌 Connection state: ${state}`);
      });
      
      vapiInstance.on('mic-permission', (permission: any) => {
        addLog(`🎤 Microphone permission: ${permission}`);
      });

      setVapi(vapiInstance);
      addLog('✅ VAPI initialized');
    } catch (error) {
      addLog(`❌ Failed to initialize: ${error}`);
    }
  }, []);

  const startCall = async () => {
    if (!vapi) {
      addLog('❌ VAPI not initialized');
      return;
    }

    const config = {
      assistant: {
        firstMessage: "Hello! This is a test call. Can you hear me?",
        model: {
          provider: "openai",
          model: "gpt-3.5-turbo",
          systemPrompt: "You are a helpful test assistant. Keep responses very short.",
        },
        voice: {
          provider: "openai",
          model: "tts-1",
          voiceId: "alloy",
        },
      }
    };

    addLog('🚀 Starting call with config:');
    addLog(JSON.stringify(config, null, 2));

    try {
      await vapi.start(config);
      addLog('✅ Call started successfully');
    } catch (error) {
      addLog(`❌ Failed to start call: ${error}`);
    }
  };

  const endCall = async () => {
    if (vapi) {
      await vapi.stop();
      addLog('🛑 Call stopped');
    }
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <h1 className="text-2xl font-bold text-white mb-8">VAPI Test Page</h1>
      
      <div className="max-w-2xl">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Controls</h2>
          
          <button
            onClick={isCallActive ? endCall : startCall}
            className={`px-6 py-3 rounded-lg font-medium text-white ${
              isCallActive 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isCallActive ? 'End Test Call' : 'Start Test Call'}
          </button>
          
          <div className="mt-4 text-sm text-gray-400">
            <p>VAPI initialized: {vapi ? '✅' : '❌'}</p>
            <p>Call active: {isCallActive ? '✅' : '❌'}</p>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Logs</h2>
          <div className="font-mono text-xs text-gray-300 space-y-1 max-h-96 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}