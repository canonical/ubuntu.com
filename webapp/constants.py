# Centralised UI translations for Engage pages and other shared constants

ENGAGE_UI_TRANSLATIONS = {
    "additional_resources": {
        "en": "Additional Resources",
        "es": "Recursos adicionales",
        "fr": "Ressources supplémentaires",
        "pt": "Recursos adicionais",
        "de": "Zusätzliche Ressourcen",
        "tr": "Ek Kaynaklar",
        "it": "Risorse aggiuntive",
    },
    "thank_you_page_title": {
        "en": "Download {resource_name}",
        "de": "Herunterladen {resource_name}",
        "es": "Descarga {resource_name}",
        "fr": "Télécharger {resource_name}",
        "it": "Download {resource_name}",
        "kr": "다운로드 {resource_name}",
        "pt": "Download {resource_name}",
        "ru": "Загрузить {resource_name}",
        "tr": "{resource_name} İndir",
    },
    "thank_you_heading": {
        "en": "Thank you",
        "de": "Danke",
        "es": "Gracias",
        "fr": "Merci",
        "it": "Grazie",
        "kr": "감사합니다",
        "pt": "Obrigado",
        "ru": "Спасибо",
        "tr": "Teşekkürler",
    },
    "thank_you_ready_to_download": {
        "en": "The {resource_name} is now ready to download.",
        "de": "{resource_name} ist jetzt zum Download bereit.",
        "es": "El {resource_name} está listo para descargar.",
        "fr": "La {resource_name} est prête à être téléchargée.",
        "it": "La {resource_name} risorsa è ora pronta per il scarica.",
        "kr": "이제 {resource_name}을(를) 다운로드할 준비가 되었습니다.",
        "pt": "{resource_name} está pronto para download.",
        "ru": "{resource_name} готов к загрузке.",
        "tr": "{resource_name} şimdi indirilmeye hazır.",
    },
    "thank_you_email_sent": {
        "en": (
            "We've emailed a copy of {resource_name} to {email}. "
            "Didn't get it? Check your spam folder and that you've "
            "used the right email address."
        ),
        "de": (
            "Wir haben eine Kopie des Whitepapers per e-mail "
            "{resource_name} an {email}. Nicht erhalten? Überprüfen Sie "
            "Ihren Spam-Ordner und ob Sie die richtige E-Mail-Adresse "
            "verwendet haben."
        ),
        "es": (
            "Le hemos enviado una copia de {resource_name} a {email}. "
            "¿No lo ha recibido? Revise la carpeta de spam y asegúrese "
            "de haber introducido el e-mail correcto."
        ),
        "fr": (
            "Nous avons envoyé une copie de {resource_name} à {email}. "
            "Pas reçu? Vérifiez votre dossier spam et vérifiez que "
            "vous avez utilisé la bonne adresse e-mail."
        ),
        "it": (
            "Abbiamo inviato una copia di {resource_name} a {email}. "
            "Non l'hai ricevuto? Controlla la tua cartella spam e di "
            "aver utilizzato l'indirizzo email corretto."
        ),
        "kr": (
            "다음의 {resource_name} 내용을 {email}로 보내드렸습니다. "
            "받지 못하셨나요? 스팸 폴더를 확인하고 올바른 이메일 "
            "주소를 사용했는지 확인하세요."
        ),
        "pt": (
            "Enviamos uma cópia do e-mail {resource_name} para "
            "{email}. Não recebeu? Verifique sua pasta de spam e se "
            "você usou o endereço de e-mail correto."
        ),
        "ru": (
            "Мы отправили вам копию {resource_name} по {email}. "
            "Не получил? Проверьте папку со спамом и убедитесь, что "
            "вы использовали правильный адрес электронной почты."
        ),
        "tr": (
            "Bir kopyasını {resource_name} e-posta adresinize "
            "gönderdik: {email}. E-postayı almadınız mı? Spam "
            "klasörünüzü kontrol edin ve doğru e-posta adresini "
            "kullandığınızdan emin olun."
        ),
    },
    "thank_you_go_back": {
        "en": "Go back",
        "de": "Zurück zur letzten Seite",
        "es": "A la página anterior",
        "fr": "Retour à la dernière page",
        "it": "Torna all'ultima pagina",
        "kr": "마지막 페이지로 돌아가기",
        "pt": "Voltar para a última página",
        "ru": "Вернуться к последней странице",
        "tr": "Önceki sayfaya dön",
    },
    "thank_you_contact_us": {
        "en": "Contact us",
        "de": "Kontaktiere uns",
        "es": "Contáctanos",
        "fr": "Contactez-nous",
        "it": "Contattaci",
        "kr": "문의하기",
        "pt": "Contate-Nos",
        "ru": "Свяжитесь с нами",
        "tr": "Bize Ulaşın",
    },
    "thank_you_download": {
        "en": "Download",
        "de": "Herunterladen",
        "es": "Descargar",
        "fr": "Téléchargée",
        "it": "Scarica",
        "kr": "다운로드",
        "pt": "Download",
        "ru": "Загрузить",
        "tr": "İndir",
    },
    "thank_you_additional_resources": {
        "en": "Additional resources",
        "de": "Das könnte Sie auch interessieren",
        "es": "También te puede interesar",
        "fr": "Vous pourriez également être intéressé par",
        "it": "Ti potrebbero interessare anche",
        "kr": "당신이 또 관심 있어야 할 주제는 다음과 같습니다",
        "pt": "Você também pode estar interessado em",
        "tr": "İlgilenebileceğiniz diğer içerikler",
    },
}

# Content Security Policy configuration
CSP = {
    "default-src": ["'self'"],
    "img-src": [
        "data: blob:",
        # This is needed to allow images from
        # https://www.google.*/ads/ga-audiences to load.
        "*",
    ],
    "script-src-elem": [
        "'self'",
        "assets.ubuntu.com",
        "www.google-analytics.com",
        "www.googletagmanager.com",
        "dev.visualwebsiteoptimizer.com",
        "www.youtube.com",
        "asciinema.org",
        "player.vimeo.com",
        "script.crazyegg.com",
        "w.usabilla.com",
        "munchkin.marketo.net",
        "serve.nrich.ai",
        "ml314.com",
        "scout-cdn.salesloft.com",
        "snippet.maze.co",
        "www.googleadservices.com",
        "js.zi-scripts.com",
        "*.g.doubleclick.net",
        "www.google.com",
        "www.gstatic.com",
        "*.googlesyndication.com",
        "js.stripe.com",
        "d3js.org",
        "www.brighttalk.com",
        "cdnjs.cloudflare.com",
        "static.ads-twitter.com",
        "*.cdn.digitaloceanspaces.com",
        "www.redditstatic.com",
        "snap.licdn.com",
        "connect.facebook.net",
        "jspm.dev",
        "cdn.livechatinc.com",
        "api.livechatinc.com",
        "secure.livechatinc.com",
        "www.tfaforms.com",
        "api.usabilla.com",
        "*.cloudfront.net",
        "cdn.jsdelivr.net",
        "*.g.doubleclick.net",
        "extend.vimeocdn.com",
        "tracking-api.g2.com",
        "'unsafe-inline'",
    ],
    "font-src": [
        "'self'",
        "assets.ubuntu.com",
        "cdn.livechatinc.com",
        "secure.livechatinc.com",
        "fonts.google.com",
    ],
    "script-src": [
        "'self'",
        "blob:",
        "*.livechatinc.com",
        "*.youtube.com",
        "*.google.com",
        "*.livechat-static.com",
        "'unsafe-eval'",
        "'unsafe-hashes'",
        "'unsafe-inline'",
    ],
    "connect-src": [
        "'self'",
        "*.googlesyndication.com",
        "www.google.com",
        "ubuntu.com",
        "analytics.google.com",
        "www.googletagmanager.com",
        "sentry.is.canonical.com",
        "www.google-analytics.com",
        "*.crazyegg.com",
        "scout.salesloft.com",
        "*.g.doubleclick.net",
        "js.zi-scripts.com",
        "*.mktoresp.com",
        "prompts.maze.co",
        "*.google-analytics.com",
        "pixel-config.reddit.com",
        "www.redditstatic.com",
        "conversions-config.reddit.com",
        "px.ads.linkedin.com",
        "ws.zoominfo.com",
        "youtube.com",
        "google.com",
        "fonts.google.com",
        "api.text.com",
        "raw.githubusercontent.com",
        "*.analytics.google.com",
        "*.g.doubleclick.net",
        "ad.doubleclick.net",
        "www.googleadservices.com",
        "www.facebook.com",
        "*.livechatinc.com",
        "*.text.com",
        "*.youtube.com",
        "*.google.com",
    ],
    "frame-src": [
        "'self'",
        "*.doubleclick.net",
        "www.youtube.com/",
        "asciinema.org",
        "player.vimeo.com",
        "js.stripe.com",
        "www.googletagmanager.com",
        "www.google.com",
        "www.brighttalk.com",
        "cdn.livechatinc.com",
        "secure.livechatinc.com",
        "cdn.livechat-static.com",
        "*.cloudfront.net",
        "app3.trueability.com",
        "app.trueability.com",
        "pay.stripe.com",
    ],
    "style-src": [
        "*.cloudfront.net",
        "cdn.jsdelivr.net",
        "'self'",
        "*.livechatinc.com",
        "*.youtube.com",
        "*.google.com",
        "'unsafe-inline'",
    ],
    "media-src": [
        "'self'",
        "res.cloudinary.com",
        "cdn.livechatinc.com",
        "secure.livechatinc.com",
        "cdn.livechat-static.com",
        "images.zenhubusercontent.com",
        "assets.ubuntu.com",
        "*.livechatinc.com",
        "*.youtube.com",
        "*.google.com",
        "*.livechat-static.com",
        "ubuntu.com",
    ],
    "child-src": [
        "api.livechatinc.com",
        "cdn.livechatinc.com",
        "secure.livechatinc.com",
        "youtube.com",
        "google.com",
        "fonts.google.com",
        "'self'",
        "*.livechatinc.com",
        "*.youtube.com",
        "*.google.com",
        "blob:",
    ],
    "object-src": [
        "'self'",
        "*.livechatinc.com",
        "*.youtube.com",
        "*.google.com",
    ],
    "frame-ancestors": [
        "https://edge-billing.stripe.com",
        "https://edge-connect.stripe.com",
        "https://edge-dashboard-admin.stripe.com",
        "https://edge-dashboard.stripe.com",
        "https://edge-docs.stripe.com",
        "https://edge-marketplace.stripe.com",
        "https://edge-support.stripe.com",
        "https://billing.stripe.com",
        "https://connect.stripe.com",
        "https://dashboard-admin.stripe.com",
        "https://dashboard.stripe.com",
        "https://docs.stripe.com",
        "https://edge-support-conversations.stripe.com",
        "https://edge.stripe.com",
        "https://marketplace.stripe.com",
        "https://stripe.com",
        "https://support-admin.corp.stripe.com",
        "https://support-conversations.stripe.com",
        "https://support.stripe.com",
    ],
}
