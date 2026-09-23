import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const RANA_COACH_SYSTEM_INSTRUCTION =
  'You are RANA X Coach, an elite AI expert in fitness, powerlifting, bodybuilding, clinical dietetics, dermatology, and physiotherapy. Only answer health-related questions. Strictly refuse non-health topics. Maintain a highly clinical and professional tone.';

export const AICoach: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: 'Greetings athlete. I am RANA X Coach—specialized in fitness programming, progressive overload, clinical dietetics, recovery, dermatology, and physiotherapy. How can I assist your health goals today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const endpoint = 'https://rana-x-backend.vercel.app/api/chat';

      const payload = {
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: RANA_COACH_SYSTEM_INSTRUCTION,
          },
          {
            role: 'user',
            content: query,
          },
        ],
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let data = await response.json().catch(() => null);

      // Seamless fallback if Groq decommissioned llama3-8b-8192
      if (data?.error || !data?.choices?.[0]?.message?.content) {
        const fallbackRes = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...payload,
            model: 'openai/gpt-oss-20b',
          }),
        });
        const fallbackData = await fallbackRes.json().catch(() => null);
        if (fallbackData?.choices?.[0]?.message?.content) {
          data = fallbackData;
        }
      }

      if (!data?.choices?.[0]?.message?.content) {
        throw new Error(data?.error?.message || `HTTP ${response.status}`);
      }

      const replyText = data.choices[0].message.content;

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('AI Coach API error:', err);
      const errorMessage: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: '⚠️ RANA X Coach is currently under maintenance. We are upgrading our neural engines. Please try again later.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                isUser ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text style={styles.senderLabel}>
                {isUser ? 'YOU' : 'RANA X COACH'}
              </Text>
              <Text style={styles.messageText}>{msg.text}</Text>
              <Text style={styles.timestamp}>{msg.timestamp}</Text>
            </View>
          );
        })}
        {isTyping && (
          <View style={[styles.messageBubble, styles.aiBubble, styles.typingRow]}>
            <ActivityIndicator size="small" color="#00F0FF" />
            <Text style={styles.typingText}>Consulting clinical health engine...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask about workouts, diet, physiotherapy..."
          placeholderTextColor="#666"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => sendMessage()}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => sendMessage()}
          disabled={isTyping}
        >
          <Text style={styles.sendButtonText}>SEND</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AICoach;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageBubble: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 0, 60, 0.15)',
    borderColor: '#FF003C',
    borderWidth: 1,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    borderColor: 'rgba(0, 240, 255, 0.3)',
    borderWidth: 1,
  },
  senderLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    color: '#888',
  },
  messageText: {
    fontSize: 14,
    color: '#EDEDED',
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    color: '#666',
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingText: {
    fontSize: 13,
    color: '#00F0FF',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#222',
    backgroundColor: '#111',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFF',
    fontSize: 14,
    borderColor: '#333',
    borderWidth: 1,
  },
  sendButton: {
    backgroundColor: '#FF003C',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
