 const fs = require('fs');
const fetch = require('node-fetch');

module.exports = {
  config: {
    name: "uptime",
    aliases: ["uptime"],
    version: "1.1",
    author: "pharouk",
    role: 0,
    shortDescription: {
      en: "Displays bot uptime with an inspiring quote."
    },
    category: "box chat",
    guide: {
      en: "Use {p}uptime to display bot uptime along with an inspiring quote."
    }
  },
  onStart: async function ({ api, event, usersData, threadsData }) {
    try {
      const loadingMessage = "𝗟𝗢𝗔𝗗𝗜𝗡𝗚 🔂 Please wait while we gather the statistics...";
      await api.sendMessage(loadingMessage, event.threadID);

      // Obtention des utilisateurs et des fils de discussion
      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();

      // Calcul de l'uptime en utilisant process.uptime()
      const uptimeInSeconds = process.uptime();
      const hours = Math.floor(uptimeInSeconds / 3600);
      const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
      const seconds = Math.floor(uptimeInSeconds % 60);
      const uptimeString = `${hours} Hrs ${minutes} mins ${seconds} secs`;

      // Obtention de la date actuelle
      const currentDate = new Date();
      const day = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      const date = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const time = currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      // URL de l'image à inclure dans le message
      const imageLink = "https://i.ibb.co/nMCdZqC/image.jpg";
      let fileName;

      // Téléchargement de l'image
      try {
        const response = await fetch(imageLink);
        const buffer = await response.buffer();
        fileName = 'uptime_image.jpg';
        fs.writeFileSync(fileName, buffer);
      } catch (imageError) {
        console.error("Failed to download image:", imageError);
        fileName = null;
      }

      // Sources de citations
      const madaraQuotes = [
        { quote: "Votre attitude... me dégoûte.", author: "Madara Uchiwa" },
        { quote: "Le plus grand mensonge de ce monde... C'est de prétendre que tu es mort.", author: "Madara Uchiwa" }
      ];

      const painQuotes = [
        { quote: "La douleur est le meilleur professeur, mais personne ne veut aller dans sa classe.", author: "Pain" },
        { quote: "Lorsque les hommes sont confrontés à de véritables désespoirs, c'est là qu'ils trouvent leur vrai potentiel.", author: "Pain" }
      ];

      // Choix aléatoire d'une source de citation
      const randomSource = Math.random() < 0.5 ? 'madara' : 'pain';
      const quotes = randomSource === 'madara' ? madaraQuotes : painQuotes;
      const { quote, author } = quotes[Math.floor(Math.random() * quotes.length)];

      // Réactions aléatoires
      const reactions = [
        "Tu es un shinobi incroyable !",
        "N'abandonne jamais, jeune ninja !",
        "Kakashi-sensei serait fier de toi !",
        "C'est le pouvoir de la volonté du feu !",
        "Les vrais ninjas mangent des ramens !",
        "Byakugan activé !",
        "Rasengan ultime !",
        "Konoha te salue !",
        "Je suis un shinobi de Konoha, un ninja vénérable !"
      ];

      // Choix aléatoire d'une réaction
      const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];

      // Construction du message final
      const messageBody = `🌐 **Statut du Bot**\n\n` +
                          `⏱️ **Uptime:** ${uptimeString}\n` +
                          `📅 **Date actuelle:** ${day}, ${date}\n` +
                          `🕒 **Heure actuelle:** ${time}\n\n` +
                          `👥 **Utilisateurs totaux:** ${allUsers.length}\n` +
                          `💬 **Fils de discussion totaux:** ${allThreads.length}\n\n` +
                          `💡 **Citation inspirante:** "${quote}" - ${author}\n\n` +
                          `🎉 ${randomReaction}`;

      // Récupération des informations sur l'utilisateur ayant déclenché la commande
      const senderID = event.senderID;
      const senderName = (await usersData.get(senderID)).name || "Utilisateur";

      // Construction du message avec mention de l'utilisateur
      const taggedMessage = {
        body: `Hey @${senderName}, voici les statistiques actuelles du bot avec une citation inspirante :\n\n${messageBody}`,
        mentions: [{ tag: `@${senderName}`, id: senderID }]
      };


      // Ajout de l'image en pièce jointe si téléchargée avec succès
      if (fileName) {
        taggedMessage.attachment = fs.createReadStream(fileName);
      }

      // Envoi du message final
      api.sendMessage(taggedMessage, event.threadID);

    } catch (error) {
      console.error(error);
      api.sendMessage("Une erreur s'est produite lors de la récupération des statistiques d'uptime 💢", event.threadID);
    }
  }
}
