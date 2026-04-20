
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex-grow pt-32 md:pt-36">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primary text-center">Политика конфиденциальности</h1>
          
          <div className="space-y-6 text-left">
            <p className="text-base leading-relaxed">
              Настоящая Политика конфиденциальности определяет, каким образом UgraBuilders собирает, использует, хранит и раскрывает информацию, полученную от пользователей веб-сайта ugrabuilders.ru. Данная политика конфиденциальности относится к Сайту и всем продуктам и услугам, предлагаемым UgraBuilders.
            </p>
            
            <h2 className="text-xl md:text-2xl font-semibold mt-8 mb-4 text-primary">Персональная информация</h2>
            <p className="text-base leading-relaxed">
              Мы можем собирать персональную информацию от Пользователей различными способами, включая, но не ограничиваясь, когда Пользователи посещают наш сайт, регистрируются на сайте, оформляют заказ, заполняют формы и в связи с другими мероприятиями, услугами, функциями или ресурсами, которые мы предоставляем на нашем Сайте.
            </p>
            
            <h2 className="text-xl md:text-2xl font-semibold mt-8 mb-4 text-primary">Использование собранной информации</h2>
            <p className="text-base leading-relaxed">
              UgraBuilders может собирать и использовать личную информацию пользователей для следующих целей:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li className="text-base leading-relaxed">Для улучшения обслуживания клиентов</li>
              <li className="text-base leading-relaxed">Для персонализации пользовательского опыта</li>
              <li className="text-base leading-relaxed">Для улучшения нашего сайта</li>
              <li className="text-base leading-relaxed">Для обработки платежей</li>
              <li className="text-base leading-relaxed">Для отправки периодических электронных писем</li>
            </ul>
            
            <h2 className="text-xl md:text-2xl font-semibold mt-8 mb-4 text-primary">Защита вашей информации</h2>
            <p className="text-base leading-relaxed">
              Мы принимаем соответствующие меры безопасности для защиты от несанкционированного доступа, изменения, раскрытия или уничтожения вашей личной информации, имени пользователя, пароля, информации о транзакциях и данных, хранящихся на нашем Сайте.
            </p>
            
            <h2 className="text-xl md:text-2xl font-semibold mt-8 mb-4 text-primary">Изменения в политике конфиденциальности</h2>
            <p className="text-base leading-relaxed">
              UgraBuilders имеет право по своему усмотрению обновлять данную политику конфиденциальности в любое время. Мы рекомендуем пользователям регулярно проверять эту страницу для отслеживания любых изменений. Вы признаете и соглашаетесь, что это ваша обязанность периодически просматривать данную политику конфиденциальности и быть в курсе изменений.
            </p>
            
            <h2 className="text-xl md:text-2xl font-semibold mt-8 mb-4 text-primary">Ваше согласие</h2>
            <p className="text-base leading-relaxed">
              Используя этот Сайт, вы выражаете свое согласие с этой политикой. Если вы не согласны с этой политикой, пожалуйста, не используйте наш Сайт. Ваше дальнейшее использование Сайта после внесения изменений в данную политику будет рассматриваться как ваше согласие с этими изменениями.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Privacy;
