'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

const FAQAccordionItem = ({ question, answer, isOpen, onClick }: FAQItem & { isOpen: boolean; onClick: () => void }) => {
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="flex w-full justify-between items-center text-left font-medium text-gray-900"
        onClick={onClick}
      >
        <span>{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="mt-2 text-gray-600">
          <p className="prose max-w-none">{answer}</p>
        </div>
      )}
    </div>
  );
};

export default function SupportPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const faqCategories: FAQCategory[] = [
    {
      title: 'Общие вопросы',
      items: [
        {
          question: 'Что такое RentEase?',
          answer: 'RentEase — это онлайн-платформа для аренды жилья, которая помогает арендаторам найти подходящее жилье, а владельцам — надежных арендаторов. Мы предлагаем удобный интерфейс для поиска, бронирования и управления арендой.'
        },
        {
          question: 'Как зарегистрироваться на платформе?',
          answer: 'Для регистрации на платформе нажмите кнопку "Войти" в верхнем правом углу главной страницы, затем выберите опцию "Зарегистрироваться". Вы можете создать аккаунт, используя электронную почту или войти через социальные сети.'
        },
        {
          question: 'Взимается ли плата за использование сервиса?',
          answer: 'Регистрация и поиск жилья на платформе бесплатны. Комиссия взимается только при успешном бронировании и составляет 5% от стоимости аренды для арендаторов и 3% для владельцев жилья.'
        }
      ]
    },
    {
      title: 'Для арендаторов',
      items: [
        {
          question: 'Как забронировать жилье?',
          answer: 'Чтобы забронировать жилье, выберите подходящий объект, укажите даты проживания и нажмите кнопку "Забронировать". После подтверждения бронирования владельцем вы получите уведомление и сможете произвести оплату.'
        },
        {
          question: 'Можно ли отменить бронирование?',
          answer: 'Да, вы можете отменить бронирование. Условия возврата средств зависят от политики отмены, установленной владельцем жилья, и времени до начала аренды. Подробную информацию можно найти на странице бронирования.'
        },
        {
          question: 'Как связаться с владельцем жилья?',
          answer: 'После подтверждения бронирования вы получите доступ к чату с владельцем жилья в личном кабинете. Там вы сможете обсудить детали заезда и задать все интересующие вопросы.'
        }
      ]
    },
    {
      title: 'Для владельцев жилья',
      items: [
        {
          question: 'Как разместить объявление о сдаче жилья?',
          answer: 'Чтобы разместить объявление, войдите в личный кабинет, перейдите в раздел "Мои объекты" и нажмите кнопку "Добавить новый объект". Заполните информацию о жилье, загрузите фотографии и установите цену.'
        },
        {
          question: 'Как устанавливается цена за аренду?',
          answer: 'Вы самостоятельно устанавливаете цену за ночь проживания. Мы предоставляем рекомендации на основе анализа рынка и похожих объектов в вашем районе, чтобы помочь определить оптимальную стоимость.'
        },
        {
          question: 'Когда я получу оплату за аренду?',
          answer: 'Оплата поступает на ваш счет в течение 24 часов после заселения арендатора. Если арендатор не предъявил претензий в течение первых суток проживания, средства автоматически переводятся на ваш счет.'
        }
      ]
    },
    {
      title: 'Безопасность и поддержка',
      items: [
        {
          question: 'Как обеспечивается безопасность платежей?',
          answer: 'Мы используем защищенные платежные шлюзы и не храним данные банковских карт пользователей. Все транзакции проходят через защищенное соединение с использованием современных протоколов шифрования.'
        },
        {
          question: 'Что делать, если возникли проблемы с арендой?',
          answer: 'В случае возникновения проблем с арендой, сначала попробуйте решить вопрос напрямую с владельцем или арендатором через чат. Если проблема не решается, обратитесь в службу поддержки через форму обратной связи или по электронной почте support@rentease.com.'
        },
        {
          question: 'Как проверяются объявления о сдаче жилья?',
          answer: 'Все новые объявления проходят модерацию перед публикацией. Мы проверяем достоверность информации, качество фотографий и соответствие описания реальным условиям. Также мы собираем и публикуем отзывы арендаторов для обеспечения прозрачности.'
        }
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Ответы на частые вопросы</h1>
      
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-600 mb-8 text-center">
          Здесь вы найдете ответы на самые распространенные вопросы о нашем сервисе.
          Если вы не нашли ответ на свой вопрос, пожалуйста, свяжитесь с нами по адресу{' '}
          <a href="mailto:artemkarpov394@gmail.com" className="text-blue-600 hover:underline">
            artemkarpov394@gmail.com
          </a>
        </p>

        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 className="text-xl font-semibold mb-4">{category.title}</h2>
              <div className="border-t border-gray-200">
                {category.items.map((item, itemIndex) => {
                  const id = `${categoryIndex}-${itemIndex}`;
                  return (
                    <FAQAccordionItem
                      key={id}
                      question={item.question}
                      answer={item.answer}
                      isOpen={!!openItems[id]}
                      onClick={() => toggleItem(id)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
