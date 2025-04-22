import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Cat from './common/Cat';
import Section from './common/Section';

const CatChat = ({ data, updateData }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Привет! Я КотоБот, ваш помощник по вопросам веса и здорового образа жизни. Что вас интересует?",
      sender: "bot"
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isWeightRelatedQuestion = (question) => {
    const keywords = ['вес', 'калори', 'диет', 'питани', 'здоров', 'фитнес', 'жир', 'имт'];
    return keywords.some(keyword => question.toLowerCase().includes(keyword));
  };

  const getWeightRelatedAnswer = (question) => {
    const q = question.toLowerCase();
    if (q.includes("похуд")) return "Попробуйте умеренный дефицит калорий и регулярные тренировки 💪";
    if (q.includes("набрать")) return "Ешьте чаще и калорийнее, и тренируйтесь с отягощением 🐾";
    if (q.includes("имт")) return "ИМТ = вес / рост². Нормой считается от 18.5 до 24.9.";
    return "Мяу! Я подскажу по вопросам питания, веса и ЗОЖ 🐱";
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMsg = { id: messages.length + 1, text: newMessage, sender: "user" };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const botText = isWeightRelatedQuestion(newMessage)
        ? getWeightRelatedAnswer(newMessage)
        : "Мяу! Я специализируюсь на вопросах веса и питания 🐾";
      const botMsg = { id: messages.length + 2, text: botText, sender: "bot" };
      setMessages(prev => [...prev, botMsg]);
    }, 500);

    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    <Section title="Кото-чат" icon="😺">
      {/* 🔹 Фоновый блок */}
      <div className="relative h-[500px] rounded-xl overflow-hidden shadow-inner">
        <div
          className="absolute inset-0 bg-repeat opacity-20 z-0"
          style={{
            backgroundImage: 'url("/images/catchat-bg.png")',
            backgroundSize: '300px',
            opacity: 0.20 // любое значение от 0 до 1
          }}
        />

        {/* 🔸 Контент чата */}
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'bot' ? 'items-start' : 'justify-end'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="mr-2">
                    <Cat size="xs" mood="happy" />
                  </div>
                )}
                <div
                  className={`px-4 py-2 rounded-xl max-w-[70%] text-sm shadow ${
                    msg.sender === 'bot'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-pink-100 text-pink-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Поле ввода */}
          <div className="flex border-t px-3 py-2 bg-purple-50">
            <input
              type="text"
              className="flex-1 px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Напиши вопрос..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button
              className="ml-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
              onClick={handleSendMessage}
            >
              📤
            </button>
          </div>
        </div>
      </div>
    </Section>
  );
};

CatChat.propTypes = {
  data: PropTypes.shape({
    currentWeight: PropTypes.number.isRequired,
    targetWeight: PropTypes.number.isRequired,
    startWeight: PropTypes.number.isRequired,
  }).isRequired,
  updateData: PropTypes.func.isRequired
};

export default CatChat;
