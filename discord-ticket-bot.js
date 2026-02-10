const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder,
    ButtonStyle,
    ChannelType,
    PermissionFlagsBits,
    ActivityType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    SlashCommandBuilder,
    REST,
    Routes
} = require('discord.js');
const express = require('express');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

try {
    require('dotenv').config();
} catch (e) {
    console.warn('Warning: dotenv not found. If you see a "Cannot find module \"dotenv\"" error, run `npm install` in the project folder to install dependencies.');
}

// ==================== ВЕБ-СЕРВЕР (АНТИ-СОН) ====================
const app = express();
app.get('/', (req, res) => res.send('ИГРАЕМ ВМЕСТЕ Bot is Online! 🎮'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Веб-сервер запущен на порту ${PORT}`));

setInterval(() => {
    require('http').get(`http://localhost:${PORT}`);
    console.log('🔄 Автопинг выполнен');
}, 5 * 60 * 1000);

// ==================== КОНФИГУРАЦИЯ ====================
const CONFIG = {
    // 🔐 ОСНОВНЫЕ ДАННЫЕ БОТА
    TOKEN: process.env.BOT_TOKEN,
    CLIENT_ID: process.env.CLIENT_ID,
    
    // 🛡️ МОДЕРАЦИЯ И АДМИНИСТРИРОВАНИЕ
    STAFF_ROLE_ID: process.env.STAFF_ROLE_ID,
    LOG_CHANNEL_ID: process.env.LOG_CHANNEL_ID,
    CREATOR_ROLE_ID: process.env.CREATOR_ROLE_ID,
    
    // 🎫 СИСТЕМА ТИКЕТОВ
    TICKET_CATEGORY_ID: process.env.TICKET_CATEGORY_ID,
    TICKETS_CHANNEL_ID: process.env.TICKETS_CHANNEL_ID,
    
    // 🎙️ ГОЛОСОВЫЕ КАНАЛЫ
    VOICE_CATEGORY_ID: process.env.VOICE_CATEGORY_ID,
    
    // 👋 ПРИВЕТСТВИЕ
    WELCOME_CHANNEL_ID: process.env.WELCOME_CHANNEL_ID,
    
    // 📺 YOUTUBE
    YOUTUBE_NOTIFICATION_CHANNEL_ID: process.env.YOUTUBE_NOTIFICATION_CHANNEL_ID,
    
    // 🎬 YOUTUBE КОНФИГУРАЦИЯ
    YOUTUBE_CHANNEL: process.env.YOUTUBE_CHANNEL,
    YOUTUBE_CHANNEL_ID: process.env.YOUTUBE_CHANNEL_ID,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    
    // ⭐ РОЛИ ПО УРОВНЯМ
    LEVEL_ROLES: {
        5: process.env.LEVEL_ROLE_5 || '',
        10: process.env.LEVEL_ROLE_10 || '',
        25: process.env.LEVEL_ROLE_25 || '',
        50: process.env.LEVEL_ROLE_50 || '',
        100: process.env.LEVEL_ROLE_100 || ''
    },
    
    // 👑 ПРЕМИУМ РОЛИ
    VIP_ROLE_ID: process.env.VIP_ROLE_ID,
    PREMIUM_ROLE_ID: process.env.PREMIUM_ROLE_ID,
    OLDTIMER_ROLE_ID: process.env.OLDTIMER_ROLE_ID
};

const GIFS = {
    YOUTUBE_PROMO: 'https://media.giphy.com/media/13Nc3xlO1kGg3S/giphy.gif',
    LEVEL_UP: 'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif',
    SHOP: 'https://media.giphy.com/media/67ThRZlYBvibtdF9JH/giphy.gif'
};

const COLORS = {
    YOUTUBE: '#FF0000',
    SUCCESS: '#10B981',
    DANGER: '#EF4444',
    PRIMARY: '#5865F2',
    GOLD: '#FFD700',
    PURPLE: '#9B59B6'
};

const TICKET_CATEGORIES = [
    { label: '🎬 Предложение по видео', value: 'video_idea', emoji: '🎬' },
    { label: '🤝 Сотрудничество', value: 'collaboration', emoji: '🤝' },
    { label: '🎮 Игровой вопрос', value: 'gaming', emoji: '🎮' },
    { label: '💬 Общий вопрос', value: 'general', emoji: '💬' },
    { label: '🐛 Техническая проблема', value: 'technical', emoji: '🐛' },
    { label: '📋 Другое', value: 'other', emoji: '📋' }
];

const LEVEL_CONFIG = {
    BASE_XP: 100,
    MULTIPLIER: 1.5,
    XP_PER_MESSAGE: 15,
    XP_COOLDOWN: 60000,
    XP_PER_VOICE_MINUTE: 5
};

const SHOP_ITEMS = [
    {
        id: 'premium_role',
        name: '💎 Premium',
        description: '💎 Premium статус\n\n' +
                     '✨ Что получаешь:\n' +
                     '• Команда /premium - получай 50 монет каждые 12 часов\n' +
                     '• Эксклюзивная роль на сервере\n' +
                     '• Особый цвет в списке участников\n\n' +
                     '⏰ Бонус монет: 50 монет / 12 часов',
        price: 3000,
        type: 'role',
        roleId: CONFIG.PREMIUM_ROLE_ID,
        emoji: '💎'
    },
    {
        id: 'vip_role',
        name: '👑 VIP',
        description: '👑 VIP статус\n\n' +
                     '✨ Что получаешь:\n' +
                     '• БУСТ x2 ко ВСЕМ получаемым монетам (сообщения, войс, награды)\n' +
                     '• Эксклюзивная VIP роль\n' +
                     '• Особый цвет в списке участников\n' +
                     '• Престиж и уважение на сервере\n\n' +
                     '💰 Пример: вместо 15 монет за сообщение получаешь 30',
        price: 5000,
        type: 'role',
        roleId: CONFIG.VIP_ROLE_ID,
        emoji: '👑'
    },
    {
        id: 'oldtimer_role',
        name: '🏆 Старичок',
        description: '🏆 Старичок сервера\n\n' +
                     '✨ Что получаешь:\n' +
                     '• Команда /oldtimer - получай 150 монет каждые 24 часа\n' +
                     '• Легендарная роль старожила сервера\n' +
                     '• Особый цвет в списке участников\n' +
                     '• Уважение как ветеран сообщества\n\n' +
                     '⏰ Бонус монет: 150 монет / 24 часа',
        price: 10000,
        type: 'role',
        roleId: CONFIG.OLDTIMER_ROLE_ID,
        emoji: '🏆'
    }
];

// ==================== SLASH КОМАНДЫ ====================
const commands = [
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('📋 Показать все доступные команды'),
    
    new SlashCommandBuilder()
        .setName('info')
        .setDescription('📊 Информация о сервере'),
    
    new SlashCommandBuilder()
        .setName('rules')
        .setDescription('📜 Правила сервера'),
    
    new SlashCommandBuilder()
        .setName('youtube')
        .setDescription('📺 Ссылка на YouTube канал'),
    
    new SlashCommandBuilder()
        .setName('rank')
        .setDescription('⭐ Показать ваш профиль и статистику')
        .addUserOption(option => 
            option.setName('пользователь')
                .setDescription('Посмотреть профиль другого пользователя')
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('🏆 Таблица лидеров (топ-10)'),
    
    new SlashCommandBuilder()
        .setName('daily')
        .setDescription('🎁 Получить ежедневную награду (каждые 24ч)'),
    
    new SlashCommandBuilder()
        .setName('shop')
        .setDescription('🛒 Открыть магазин'),
    
    new SlashCommandBuilder()
        .setName('balance')
        .setDescription('💰 Показать ваш баланс'),
    
    new SlashCommandBuilder()
        .setName('transfer')
        .setDescription('💸 Передать монеты другому пользователю')
        .addUserOption(option => option.setName('user').setDescription('Кому передать').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('Сумма').setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('bank')
        .setDescription('🏦 Операции с банком')
        .addSubcommand(sub => sub.setName('deposit').setDescription('Положить в банк').addIntegerOption(opt => opt.setName('amount').setDescription('Сумма').setRequired(true)))
        .addSubcommand(sub => sub.setName('withdraw').setDescription('Снять из банка').addIntegerOption(opt => opt.setName('amount').setDescription('Сумма').setRequired(true)))
        .addSubcommand(sub => sub.setName('apply_interest').setDescription('Начислить проценты (админ)').addIntegerOption(opt => opt.setName('percent').setDescription('Процент').setRequired(true))),
    
    new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('🎒 Показать ваши покупки'),
    
    new SlashCommandBuilder()
        .setName('premium')
        .setDescription('💎 Получить Premium награду (50 монет / 12ч)'),
    
    new SlashCommandBuilder()
        .setName('oldtimer')
        .setDescription('🏆 Получить награду Старичка (150 монет / 24ч)'),
    
    new SlashCommandBuilder()
        .setName('warn')
        .setDescription('🛡️ Выдать предупреждение пользователю')
        .addUserOption(opt => opt.setName('user').setDescription('Кому выдать').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Причина')), 
    
    new SlashCommandBuilder()
        .setName('mute')
        .setDescription('🔇 Замутить пользователя')
        .addUserOption(opt => opt.setName('user').setDescription('Кого замутить').setRequired(true))
        .addIntegerOption(opt => opt.setName('minutes').setDescription('Длительность в минутах (по умолчанию 10)'))
        .addStringOption(opt => opt.setName('reason').setDescription('Причина')),
    
    new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('🔈 Размутить пользователя')
        .addUserOption(opt => opt.setName('user').setDescription('Кого размутить').setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('👢 Кикнуть пользователя')
        .addUserOption(opt => opt.setName('user').setDescription('Кого кикнуть').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Причина')),
    
    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('⛔ Забанить пользователя')
        .addUserOption(opt => opt.setName('user').setDescription('Кого забанить').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Причина'))
        .addIntegerOption(opt => opt.setName('minutes').setDescription('Длительность в минутах (0 = перманентный)').setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('unban')
        .setDescription('🔓 Разбанить пользователя')
        .addUserOption(opt => opt.setName('user').setDescription('Кого разбанить').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Причина')),
    
    new SlashCommandBuilder()
        .setName('give')
        .setDescription('💵 Выдать монеты пользователю (админ)')
        .addUserOption(opt => opt.setName('user').setDescription('Кому выдать').setRequired(true))
        .addIntegerOption(opt => opt.setName('amount').setDescription('Сумма').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    new SlashCommandBuilder()
        .setName('addex')
        .setDescription('⭐ Добавить опыт пользователю (админ)')
        .addUserOption(opt => opt.setName('user').setDescription('Кому добавить').setRequired(true))
        .addIntegerOption(opt => opt.setName('amount').setDescription('Количество XP').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    new SlashCommandBuilder()
        .setName('addlevel')
        .setDescription('📈 Добавить уровень пользователю (админ)')
        .addUserOption(opt => opt.setName('user').setDescription('Кому добавить').setRequired(true))
        .addIntegerOption(opt => opt.setName('levels').setDescription('Количество уровней').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    new SlashCommandBuilder()
        .setName('adminhelp')
        .setDescription('⚙️ Команды для администраторов')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    new SlashCommandBuilder()
        .setName('room')
        .setDescription('🎙️ Управление временной голосовой комнатой')
        .addSubcommand(sub => sub.setName('lock').setDescription('Заблокировать комнату'))
        .addSubcommand(sub => sub.setName('unlock').setDescription('Разблокировать комнату'))
        .addSubcommand(sub => sub.setName('rename').setDescription('Переименовать комнату').addStringOption(opt => opt.setName('name').setDescription('Новое имя').setRequired(true)))
        .addSubcommand(sub => sub.setName('limit').setDescription('Установить лимит участников').addIntegerOption(opt => opt.setName('size').setDescription('Максимум участников').setRequired(true)))
        .addSubcommand(sub => sub.setName('claim').setDescription('Забрать владение комнатой'))
].map(command => command.toJSON());

// Регистрация команд
const rest = new REST({ version: '10' }).setToken(CONFIG.TOKEN);

(async () => {
    try {
        console.log('🔄 Начинаю регистрацию slash-команд...');
        
        const guildId = process.env.GUILD_ID;
        if (guildId) {
            await rest.put(
                Routes.applicationGuildCommands(CONFIG.CLIENT_ID, guildId),
                { body: commands },
            );
            console.log(`✅ Команды синхронизированы для сервера! (Гильдия: ${guildId})`);
        } else {
            await rest.put(
                Routes.applicationCommands(CONFIG.CLIENT_ID),
                { body: commands },
            );
            console.log('✅ Slash-команды успешно зарегистрированы глобально!');
            console.log('💡 Для быстрой синхронизации добавьте GUILD_ID в .env');
        }
    } catch (error) {
        console.error('❌ Ошибка регистрации команд:', error);
    }
})();

// ==================== ОБЛАЧНОЕ ХРАНИЛИЩЕ (Supabase) ====================
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Наша оперативная память
let db = {
    users: {},    
    youtube: { lastVideoId: null, lastCheck: Date.now() },
    settings: { autoRoleId: null },
    tickets: {},
    tempVoiceRooms: {},
    ticketCounter: 0
};

// ==================== ФУНКЦИИ РАБОТЫ С БАЗОЙ ДАННЫХ ====================

// Функция загрузки
async function syncFromCloud() {
    try {
        const { data, error } = await supabase.from('global_store').select('data').eq('id', 1).single();
        if (data && data.data) {
            db.users = data.data.users || {};
            db.youtube = data.data.youtube || { lastVideoId: null, lastCheck: Date.now() };
            db.settings = data.data.settings || { autoRoleId: null };
            db.tickets = data.data.tickets || {};
            db.tempVoiceRooms = data.data.tempVoiceRooms || {};
            db.ticketCounter = data.data.ticketCounter || 0;
            
            if (db.settings && db.settings.autoRoleId) {
                CONFIG.AUTO_ROLE_ID = db.settings.autoRoleId;
            }
            console.log('✅ [Supabase] Данные успешно загружены в память бота.');
            console.log(`📊 [Supabase] Загружено пользователей: ${Object.keys(db.users).length}`);
        } else {
            console.log('⚠️ [Supabase] База пуста, инициализирую новую запись...');
            await supabase.from('global_store').upsert({ id: 1, data: db });
        }
    } catch (err) {
        console.error('❌ [Supabase] Ошибка при загрузке данных:', err.message);
    }
}

// Функция сохранения
async function saveToCloud() {
    try {
        db.settings.autoRoleId = CONFIG.AUTO_ROLE_ID || null;
        const { error } = await supabase.from('global_store').upsert({ 
            id: 1, 
            data: {
                users: db.users,
                youtube: db.youtube,
                settings: db.settings,
                tickets: db.tickets,
                tempVoiceRooms: db.tempVoiceRooms,
                ticketCounter: db.ticketCounter
            }
        });
        if (error) throw error;
    } catch (err) {
        console.error('❌ [Supabase] Ошибка сохранения:', err.message);
    }
}

// Запускаем загрузку данных при старте
syncFromCloud();

// Авто-сохранение каждые 5 минут
setInterval(async () => {
    await saveToCloud();
    console.log('💾 [Supabase] Авто-бэкап выполнен успешно.');
}, 5 * 60 * 1000);

// ==================== ФУНКЦИИ СИСТЕМЫ УРОВНЕЙ ====================
function getUserData(userId) {
    if (!db.users[userId]) {
        db.users[userId] = {
            xp: 0,
            level: 1,
            coins: 0,
            bank: 0,
            warns: [],
            lastXpGain: 0,
            voiceTime: 0,
            messageCount: 0,
            inventory: [],
            lastDaily: 0,
            lastPremium: 0,
            lastOldtimer: 0
        };
    }
    return db.users[userId];
}

function calculateLevel(xp) {
    let level = 1;
    let requiredXP = LEVEL_CONFIG.BASE_XP;
    
    while (xp >= requiredXP) {
        xp -= requiredXP;
        level++;
        requiredXP = Math.floor(LEVEL_CONFIG.BASE_XP * Math.pow(LEVEL_CONFIG.MULTIPLIER, level - 1));
    }
    
    return level;
}

function getRequiredXP(level) {
    return Math.floor(LEVEL_CONFIG.BASE_XP * Math.pow(LEVEL_CONFIG.MULTIPLIER, level - 1));
}

function addXP(userId, amount, member = null) {
    const user = getUserData(userId);
    const oldLevel = user.level;
    
    user.xp += amount;
    user.level = calculateLevel(user.xp);
    
    let coinsToAdd = Math.floor(amount / 10);
    
    if (member && member.roles.cache.has(CONFIG.VIP_ROLE_ID)) {
        coinsToAdd *= 2;
    }
    
    user.coins += coinsToAdd;
    
    return {
        leveledUp: user.level > oldLevel,
        oldLevel: oldLevel,
        newLevel: user.level,
        xp: user.xp,
        coins: user.coins,
        coinsAdded: coinsToAdd
    };
}

// ==================== YOUTUBE API ФУНКЦИИ ====================
async function checkNewVideo() {
    try {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${CONFIG.YOUTUBE_API_KEY}&channelId=${CONFIG.YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=1`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            const latestVideo = data.items[0];
            const videoId = latestVideo.id.videoId;
            
            if (videoId && videoId !== db.youtube.lastVideoId) {
                db.youtube.lastVideoId = videoId;
                db.youtube.lastCheck = Date.now();
                await saveToCloud();
                
                return {
                    id: videoId,
                    title: latestVideo.snippet.title,
                    description: latestVideo.snippet.description,
                    thumbnail: latestVideo.snippet.thumbnails.high.url,
                    publishedAt: latestVideo.snippet.publishedAt,
                    url: `https://www.youtube.com/watch?v=${videoId}`
                };
            }
        }
        
        db.youtube.lastCheck = Date.now();
        await saveToCloud();
        return null;
    } catch (error) {
        console.error('Ошибка проверки YouTube:', error);
        return null;
    }
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// --- Moderation helpers ---
async function ensureMutedRole(guild) {
    let role = guild.roles.cache.find(r => r.name === 'Muted');
    if (!role) {
        role = await guild.roles.create({ name: 'Muted', permissions: [] });
        for (const ch of guild.channels.cache.values()) {
            try { await ch.permissionOverwrites.create(role, { SendMessages: false, Speak: false, AddReactions: false }); } catch (e) {}
        }
    }
    return role;
}

async function logModAction(guild, text) {
    try {
        const ch = guild.channels.cache.get(CONFIG.LOG_CHANNEL_ID) || await guild.channels.fetch(CONFIG.LOG_CHANNEL_ID).catch(()=>null);
        if (ch) ch.send(text).catch(()=>{});
        else console.log('Mod log:', text);
    } catch (e) { console.error('logModAction error', e); }
}

// ==================== ОБРАБОТКА ОШИБОК ====================
process.on('unhandledRejection', (reason, promise) => console.error('Unhandled Rejection:', reason));
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));

process.on('SIGINT', async () => {
    await saveToCloud();
    process.exit(0);
});

// ==================== СИСТЕМА XP ЗА СООБЩЕНИЯ ====================
const xpCooldowns = new Map();

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    
    const userId = message.author.id;
    const user = getUserData(userId);
    
    const now = Date.now();
    const cooldown = xpCooldowns.get(userId);
    
    if (!cooldown || now - cooldown >= LEVEL_CONFIG.XP_COOLDOWN) {
        const xpGain = Math.floor(Math.random() * 11) + 10;
        
        const finalXP = xpGain;
        const result = addXP(userId, finalXP, message.member);
        
        user.messageCount++;
        xpCooldowns.set(userId, now);
        
        await saveToCloud();
        
        if (result.leveledUp) {
            const levelUpEmbed = new EmbedBuilder()
                .setColor(COLORS.GOLD)
                .setTitle('🎉 ПОВЫШЕНИЕ УРОВНЯ!')
                .setDescription(
                    `Поздравляем, ${message.author}!\n\n` +
                    `⬆️ **Уровень:** ${result.oldLevel} → **${result.newLevel}**\n` +
                    `⭐ **Опыт:** ${result.xp} XP\n` +
                    `💰 **Монеты:** ${result.coins}\n\n` +
                    `Продолжай в том же духе! 🚀`
                )
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                .setImage(GIFS.LEVEL_UP)
                .setFooter({ text: 'ИГРАЕМ ВМЕСТЕ', iconURL: message.guild.iconURL() })
                .setTimestamp();
            
            await message.channel.send({ embeds: [levelUpEmbed] });
            
            for (const [level, roleId] of Object.entries(CONFIG.LEVEL_ROLES)) {
                if (result.newLevel >= parseInt(level) && roleId && !message.member.roles.cache.has(roleId)) {
                    try {
                        await message.member.roles.add(roleId);
                        await message.channel.send(`🎊 ${message.author} получил роль за достижение ${level} уровня!`);
                    } catch (error) {
                        console.error('Ошибка выдачи роли:', error);
                    }
                }
            }
        }
    }
    
    // ==================== КОМАНДЫ !SETUP ====================
    const content = message.content.toLowerCase();
    
    if ((message.content === '!setup' || message.content === '!setup-tickets') && 
        message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        
        const embed = new EmbedBuilder()
            .setColor(COLORS.YOUTUBE)
            .setTitle('🎫 ИГРАЕМ ВМЕСТЕ - Система поддержки')
            .setDescription(
                '## 🛠️ Нужна помощь или есть предложение?\n\n' +
                'Создайте тикет и наша команда свяжется с вами в ближайшее время!\n\n' +
                '**Вы можете:**\n' +
                '🎬 Предложить идею для видео\n' +
                '🤝 Обсудить сотрудничество\n' +
                '🎮 Задать вопрос об играх\n' +
                '💬 Получить помощь по серверу\n' +
                '🐛 Сообщить о технической проблеме\n\n' +
                '**Перед созданием тикета:**\n' +
                '• Убедитесь, что у вас нет других открытых тикетов\n' +
                '• Подготовьте всю необходимую информацию\n' +
                '• Выберите правильную категорию обращения\n\n' +
                '⏱️ **Обычно мы отвечаем в течение 1-3 часов**'
            )
            .setFooter({ text: 'Нажмите кнопку ниже для создания тикета • ИГРАЕМ ВМЕСТЕ', iconURL: message.guild.iconURL() })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('start_ticket')
                .setLabel('Создать тикет')
                .setEmoji('📩')
                .setStyle(ButtonStyle.Primary)
        );

        await message.channel.send({ embeds: [embed], components: [row] });
        if (message.deletable) await message.delete();
        return;
    }

    if (message.content === '!setup-voice' && message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        const guild = message.guild;
        let joinCh = guild.channels.cache.find(c => c.type === ChannelType.GuildVoice && c.name === 'Присоединиться для создания');
        if (!joinCh) {
            try {
                const voiceCategory = CONFIG.VOICE_CATEGORY_ID ? guild.channels.cache.get(CONFIG.VOICE_CATEGORY_ID) : null;
                joinCh = await guild.channels.create({ 
                    name: 'Присоединиться для создания', 
                    type: ChannelType.GuildVoice, 
                    parent: voiceCategory?.id || null,
                    reason: 'Панель управления - Присоединиться для создания' 
                });
            } catch (e) { console.error('Ошибка создания канала "Присоединиться для создания"', e); }
        }

        const embed = new EmbedBuilder()
            .setColor(COLORS.PRIMARY)
            .setTitle('🎙️ Система управления голосовыми комнатами ИГРАЕМ ВМЕСТЕ')
            .setDescription(
                `**Добро пожаловать в панель управления голосовыми каналами!** 🎤\n\n` +
                `Эта панель позволяет администраторам управлять временными голосовыми комнатами.\n\n` +
                `**📋 Как это работает:**\n` +
                `1️⃣ Нажмите на кнопку **"Инструкция"** для получения справки\n` +
                `2️⃣ Используйте кнопки управления для редактирования комнат\n` +
                `3️⃣ Вы должны находиться в целевой комнате для управления её параметрами\n\n` +
                `**🔧 Доступные команды:**\n` +
                `🔒 **Заблокировать** - запретить вход в комнату\n` +
                `🔓 **Разблокировать** - разрешить вход в комнату\n` +
                `✏️ **Переименовать** - изменить название комнаты\n` +
                `🔢 **Лимит** - установить максимум участников\n` +
                `🤝 **Забрать владение** - стать владельцем комнаты\n\n` +
                `⚠️ **Важно:** Все действия логируются в канал модерации!`
            )
            .setFooter({ text: 'ИГРАЕМ ВМЕСТЕ • Система голосовых комнат', iconURL: message.guild.iconURL() })
            .setTimestamp();

        const infoRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('join_to_create_panel').setLabel('📖 Инструкция').setStyle(ButtonStyle.Primary).setEmoji('❓')
        );

        const controlRow1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('vc_lock').setLabel('🔒 Заблокировать').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('vc_unlock').setLabel('🔓 Разблокировать').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('vc_rename').setLabel('✏️ Переименовать').setStyle(ButtonStyle.Primary)
        );

        const controlRow2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('vc_limit').setLabel('🔢 Установить лимит').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('vc_claim').setLabel('🤝 Забрать владение').setStyle(ButtonStyle.Secondary)
        );

        await message.channel.send({ embeds: [embed], components: [infoRow, controlRow1, controlRow2] });
        if (message.deletable) await message.delete();
        return;
    }

    if (message.content === '!setup-status' && message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        const guild = message.guild;
        
        try {
            let statusCategory = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name === '📊 Статус');
            if (!statusCategory) {
                statusCategory = await guild.channels.create({
                    name: '📊 Статус',
                    type: ChannelType.GuildCategory,
                    reason: 'Категория для статус-каналов',
                    position: 0
                });
                console.log('✅ Категория Статус создана в самом верху');
            } else {
                await statusCategory.setPosition(0).catch(() => {});
            }

            const totalMembers = guild.memberCount;
            const voiceMembers = guild.members.cache.filter(m => m.voice.channel).size;
            const boosts = guild.premiumSubscriptionCount || 0;

            const channelConfigs = [
                { id: 'members', name: `👥 Всего участников: ${totalMembers}` },
                { id: 'online', name: `🟢 В голосе: ${voiceMembers}` },
                { id: 'boosts', name: `⭐ Бусты: ${boosts}` }
            ];

            for (const config of channelConfigs) {
                let statusChannel = null;
                
                for (const ch of guild.channels.cache.values()) {
                    if (ch.type === ChannelType.GuildVoice && ch.parentId === statusCategory.id) {
                        if ((config.id === 'members' && ch.name.startsWith('👥')) ||
                            (config.id === 'online' && ch.name.startsWith('🟢')) ||
                            (config.id === 'boosts' && ch.name.startsWith('⭐'))) {
                            statusChannel = ch;
                            break;
                        }
                    }
                }

                if (!statusChannel) {
                    statusChannel = await guild.channels.create({
                        name: config.name,
                        type: ChannelType.GuildVoice,
                        parent: statusCategory.id,
                        reason: 'Статус-канал',
                        userLimit: 0
                    });
                    console.log(`✅ Статус-канал создан: ${config.name}`);
                } else {
                    await statusChannel.setName(config.name).catch(() => {});
                    console.log(`✅ Статус-канал обновлён: ${config.name}`);
                }

                await statusChannel.permissionOverwrites.create(guild.roles.everyone, {
                    Connect: false,
                    ViewChannel: true,
                    Speak: false,
                    MuteMembers: false,
                    DeafenMembers: false
                }).catch(() => {});
            }

            const successEmbed = new EmbedBuilder()
                .setColor(COLORS.SUCCESS)
                .setTitle('✅ Система статуса настроена')
                .setDescription(
                    `**📊 Категория "Статус" создана в самом верху!**\n\n` +
                    `**Созданные каналы:**\n` +
                    `👥 Всего участников - общее количество членов сервера\n` +
                    `🟢 В голосе - количество участников в голосовых каналах\n` +
                    `⭐ Бусты - количество бустов сервера\n\n` +
                    `🔒 **Все каналы закрыты** - пользователи могут только видеть информацию\n\n` +
                    `⏰ **Обновление:** Статистика обновляется при входе в войс и каждые 5 минут`
                )
                .setFooter({ text: 'ИГРАЕМ ВМЕСТЕ • Система статуса', iconURL: guild.iconURL() })
                .setTimestamp();

            await message.channel.send({ embeds: [successEmbed] });
            if (message.deletable) await message.delete();

        } catch (error) {
            console.error('❌ Ошибка при создании статус-каналов:', error);
            await message.reply({ 
                content: '❌ Произошла ошибка при создании статус-каналов. Проверьте логи.',
                allowedMentions: { repliedUser: false }
            });
        }
        return;
    }

    if (message.content.startsWith('!set-autorole') && message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        const args = message.content.split(' ').slice(1);
        if (args.length === 0) return message.reply({ content: '❌ Укажите роль (упоминание, ID или точное название).', allowedMentions: { repliedUser: false } });
        const roleArg = args.join(' ').trim();
        let role = null;
        const mentionMatch = roleArg.match(/^<@&?(\d+)>$/);
        if (mentionMatch) role = message.guild.roles.cache.get(mentionMatch[1]);
        if (!role && /^\d+$/.test(roleArg)) role = message.guild.roles.cache.get(roleArg);
        if (!role) role = message.guild.roles.cache.find(r => r.name === roleArg);
        if (!role) return message.reply({ content: '❌ Роль не найдена. Укажите корректную роль.', allowedMentions: { repliedUser: false } });

        CONFIG.AUTO_ROLE_ID = role.id;
        await saveToCloud();
        await message.reply({ content: `✅ Авто-роль установлена: ${role.name}` });
        console.log(`🔧 Авто-роль установлена на ${role.id} (${role.name})`);
        return;
    }

    if (message.content === '!clear-autorole' && message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        CONFIG.AUTO_ROLE_ID = '';
        await saveToCloud();
        await message.reply({ content: '✅ Авто-роль удалена.' });
        console.log('🔧 Авто-роль удалена');
        return;
    }
});

// ==================== СИСТЕМА XP ЗА ГОЛОСОВЫЕ КАНАЛЫ ====================
const voiceJoinTimes = new Map();

client.on('voiceStateUpdate', async (oldState, newState) => {
    const userId = newState.id;
    
    if (!oldState.channel && newState.channel) {
        try {
            const joinChannel = newState.channel;
            if (joinChannel && joinChannel.name === 'Присоединиться для создания') {
                const guild = newState.guild;
                const creator = newState.member;
                const parent = joinChannel.parent;
                const voiceCategory = CONFIG.VOICE_CATEGORY_ID ? guild.channels.cache.get(CONFIG.VOICE_CATEGORY_ID) : null;
                const room = await guild.channels.create({ 
                    name: `Room - ${creator.displayName}`, 
                    type: ChannelType.GuildVoice, 
                    parent: voiceCategory?.id || parent 
                });
                await room.permissionOverwrites.create(creator.user.id, { Connect: true, Speak: true, ManageChannels: true });
                
                // Сохраняем в базу
                db.tempVoiceRooms[room.id] = { owner: creator.id };
                await saveToCloud();
                
                await creator.voice.setChannel(room.id).catch(()=>{});
                console.log(`✅ Создана временная комната: ${room.name} для ${creator.user.tag}`);
            }
        } catch (e) { console.error('❌ Ошибка создания временной комнаты:', e); }

        voiceJoinTimes.set(userId, Date.now());
    }
    
    if (oldState.channel && !newState.channel) {
        try {
            const oldCh = oldState.channel;
            if (oldCh && db.tempVoiceRooms[oldCh.id]) {
                if (oldCh.members.size === 0) {
                    delete db.tempVoiceRooms[oldCh.id];
                    await saveToCloud();
                    await oldCh.delete('Temporary room empty').catch(()=>{});
                }
            }
        } catch (e) { console.error('❌ Ошибка удаления временной комнаты:', e); }

        const joinTime = voiceJoinTimes.get(userId);
        if (joinTime) {
            const timeSpent = Math.floor((Date.now() - joinTime) / 60000);
            const user = getUserData(userId);
            
            if (timeSpent > 0) {
                const xpGain = timeSpent * LEVEL_CONFIG.XP_PER_VOICE_MINUTE;
                addXP(userId, xpGain);
                user.voiceTime += timeSpent;
                
                await saveToCloud();
                
                console.log(`${userId} получил ${xpGain} XP за ${timeSpent} минут в войсе`);
            }
            
            voiceJoinTimes.delete(userId);
        }
    }

    updateStatusChannels().catch(e => console.error('❌ Ошибка обновления статус-каналов:', e));
});

// ==================== ПРИВЕТСТВИЕ ====================
client.on('guildMemberAdd', async (member) => {
    const channel = member.guild.channels.cache.get(CONFIG.WELCOME_CHANNEL_ID);
    if (!channel) return;

    try {
        if (CONFIG.AUTO_ROLE_ID) {
            const role = member.guild.roles.cache.get(CONFIG.AUTO_ROLE_ID);
            if (role) {
                await member.roles.add(role, 'Auto role assigned on join').catch(() => {});
                console.log(`✅ Авто-роль выдана ${member.user.tag} -> ${role.name}`);
            }
        }
    } catch (e) { console.error('Ошибка при выдаче авто-роли:', e); }

    getUserData(member.id);
    await saveToCloud();

    const welcomeEmbed = new EmbedBuilder()
        .setColor(COLORS.YOUTUBE)
        .setAuthor({ name: member.user.username.toUpperCase(), iconURL: member.user.displayAvatarURL() })
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
        .setDescription(
            `**🎮 Добро пожаловать в сообщество ИГРАЕМ ВМЕСТЕ!** 🎮\n\n` +
            `Мы рады видеть тебя среди наших подписчиков и зрителей!\n\n` +
            `**Что здесь можно делать:**\n` +
            `🎬 Обсуждать видео и стримы\n` +
            `🎮 Играть вместе с сообществом\n` +
            `💡 Предлагать идеи для новых видео\n` +
            `🤝 Общаться с единомышленниками\n` +
            `⭐ Зарабатывать уровни и монеты\n` +
            `🛒 Покупать роли в магазине\n\n` +
            `📺 **YouTube:** [ИГРАЕМ ВМЕСТЕ](${CONFIG.YOUTUBE_CHANNEL})\n\n` +
            `Не забудь ознакомиться с **правилами сервера**!\n` +
            `Приятного времяпрепровождения! 🎉`
        )
        .setFooter({ text: `Стал ${member.guild.memberCount}-м участником сообщества`, iconURL: member.guild.iconURL() })
        .setTimestamp();

    await channel.send({ content: `${member}`, embeds: [welcomeEmbed] });
});

// ==================== ОБРАБОТКА SLASH КОМАНД ====================
client.on('interactionCreate'), async (interaction) => {
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;
        }
        // ==================== /HELP ====================
        if (commandName === 'help') {
            const helpEmbed = new EmbedBuilder()
                .setColor(COLORS.YOUTUBE)
                .setTitle('🆘 Помощь - ИГРАЕМ ВМЕСТЕ')
                .setDescription(
                    `Я — бот Discord сервера канала **ИГРАЕМ ВМЕСТЕ**! 🎮\n\n` +
                    `**📋 Основные команды:**\n` +
                    `/help — эта справка\n` +
                    `/info — информация о сервере\n` +
                    `/rules — правила сервера\n` +
                    `/youtube — ссылка на YouTube канал\n\n` +
                    `**⭐ Уровни и экономика:**\n` +
                    `/rank — ваш профиль и статистика\n` +
                    `/leaderboard — топ-10 игроков\n` +
                    `/daily — ежедневная награда\n` +
                    `/balance — показать баланс\n` +
                    `/shop — магазин ролей\n` +
                    `/inventory — ваши покупки\n\n` +
                    `**💰 Банк:**\n` +
                    `/bank deposit <amount> — положить в банк\n` +
                    `/bank withdraw <amount> — снять из банка\n` +
                    `/transfer <user> <amount> — передать монеты\n\n` +
                    `**🎙️ Голосовые комнаты:**\n` +
                    `Подключись к "Присоединиться для создания" для своей комнаты\n` +
                    `/room lock/unlock/rename/limit/claim — управление комнатой\n\n` +
                    `📺 **YouTube:** [ИГРАЕМ ВМЕСТЕ](${CONFIG.YOUTUBE_CHANNEL})`
                )
                .setFooter({ text: 'ИГРАЕМ ВМЕСТЕ', iconURL: interaction.guild.iconURL() })
                .setTimestamp();
            
            await interaction.reply({ embeds: [helpEmbed] });
        }

        // ==================== /ADMINHELP ====================
        if (commandName === 'adminhelp') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ У вас нет прав администратора!', ephemeral: true });
            }

            const adminEmbed = new EmbedBuilder()
                .setColor(COLORS.DANGER)
                .setTitle('⚙️ Команды для администраторов')
                .setDescription(
                    `**🎫 Управление тикетами:**\n` +
                    `!setup или !setup-tickets — создать панель тикетов\n\n` +
                    `**🎙️ Голосовые каналы:**\n` +
                    `!setup-voice — создать систему временных комнат\n\n` +
                    `**📊 Статус-каналы:**\n` +
                    `!setup-status — создать статус-каналы\n\n` +
                    `**🔧 Авто-роль:**\n` +
                    `!set-autorole <роль> — установить авто-роль\n` +
                    `!clear-autorole — удалить авто-роль\n\n` +
                    `**🛡️ Модерация (роль: Staff):**\n` +
                    `/warn <user> [reason] — выдать предупреждение\n` +
                    `/mute <user> [minutes] — замутить пользователя\n` +
                    `/unmute <user> — снять мут\n` +
                    `/kick <user> [reason] — кикнуть пользователя\n` +
                    `/ban <user> [reason] [minutes] — забанить пользователя\n` +
                    `/unban <user> [reason] — разбанить пользователя\n\n` +
                    `**💰 Деньги и опыт (роль: Creator):**\n` +
                    `/give <user> <amount> — выдать монеты\n` +
                    `/addex <user> <amount> — добавить XP\n` +
                    `/addlevel <user> <levels> — добавить уровни\n\n` +
                    `**🏦 Банк:**\n` +
                    `/bank apply_interest <percent> — начислить проценты на все счета`
                )
                .setFooter({ text: 'ИГРАЕМ ВМЕСТЕ • Панель администратора', iconURL: interaction.guild.iconURL() })
                .setTimestamp();
            
            await interaction.reply({ embeds: [adminEmbed], ephemeral: true });
        }

        // ==================== /RANK ====================
        if (commandName === 'rank') {
            const targetUser = interaction.options.getUser('пользователь') || interaction.user;
            const user = getUserData(targetUser.id);
            const requiredXP = getRequiredXP(user.level);
            
            let totalXP = 0;
            for (let i = 1; i < user.level; i++) {
                totalXP += getRequiredXP(i);
            }
            totalXP += user.xp;
            
            const currentLevelXP = user.xp;
            const progress = Math.floor((currentLevelXP / requiredXP) * 100);
            
            const rankEmbed = new EmbedBuilder()
                .setColor(COLORS.PURPLE)
                .setTitle(`📊 Профиль ${targetUser.username}`)
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
                .setDescription(
                    `**⭐ Уровень:** ${user.level}\n` +
                    `**✨ Опыт:** ${currentLevelXP} / ${requiredXP} XP (${progress}%)\n` +
                    `**💰 Монеты:** ${user.coins}\n` +
                    `**🏦 Банк:** ${user.bank}\n` +
                    `**💬 Сообщений:** ${user.messageCount}\n` +
                    `**🎙️ Время в войсе:** ${Math.floor(user.voiceTime / 60)}ч ${user.voiceTime % 60}м\n\n` +
                    `**Прогресс до ${user.level + 1} уровня:**\n` +
                    `${'█'.repeat(Math.floor(progress / 10))}${'░'.repeat(10 - Math.floor(progress / 10))} ${progress}%`
                )
                .setFooter({ text: 'ИГРАЕМ ВМЕСТЕ', iconURL: interaction.guild.iconURL() })
                .setTimestamp();
            
            await interaction.reply({ embeds: [rankEmbed] });
        }

        // ==================== /LEADERBOARD ====================
        if (commandName === 'leaderboard') {
            const sortedUsers = Object.entries(db.users)
                .sort(([, a], [, b]) => b.level - a.level || b.xp - a.xp)
                .slice(0, 10);
            
            let description = '';
            for (let i = 0; i < sortedUsers.length; i++) {
                const [userId, data] = sortedUsers[i];
                const member = await interaction.guild.members.fetch(userId).catch(() => null);
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
                
                if (member) {
                    description += `${medal} ${member.user.username} - Уровень **${data.level}** (${data.xp} XP)\n`;
                }
            }
            
            const leaderboardEmbed = new EmbedBuilder()
                .setColor(COLORS.GOLD)
                .setTitle('🏆 Таблица лидеров')
                .setDescription(description || 'Нет данных')
                .setFooter({ text: 'ИГРАЕМ ВМЕСТЕ', iconURL: interaction.guild.iconURL() })
                .setTimestamp();
            
            await interaction.reply({ embeds: [leaderboardEmbed] });
        }

        // ==================== /DAILY ====================
        if (commandName === 'daily') {
            const user = getUserData(interaction.user.id);
            const now = Date.now();
            const lastDaily = user.lastDaily || 0;
            const cooldown = 24 * 60 * 60 * 1000;
            
            if (now - lastDaily < cooldown) {
                const timeLeft = cooldown - (now - lastDaily);
                const hours = Math.floor(timeLeft / (60 * 60 * 1000));
                const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
                
                return interaction.reply({ content: `⏰ Вы уже получили ежедневную награду! Возвращайтесь через **${hours}ч ${minutes}м**`, ephemeral: true });
            }
            
            let reward = 100 + (user.level * 10);
            
            if (interaction.member.roles.cache.has(CONFIG.VIP_ROLE_ID)) {
                reward *= 2;
            }
            
            user.coins += reward;
            user.lastDaily = now;
            await saveToCloud();
            
            const dailyEmbed = new EmbedBuilder()
                .setColor(COLORS.SUCCESS)
                .setTitle('🎁 Ежедневная награда получена!')
                .setDescription(
                    `Вы получили **${reward} монет**!\n\n` +
                    `💰 Текущий баланс: **${user.coins} монет**\n\n` +
                    (interaction.member.roles.cache.has(CONFIG.VIP_ROLE_ID) ? '👑 **VIP буст x2 активен!**\n\n' : '') +
                    `Возвращайтесь завтра за новой наградой! 🎉`
                )
                .setFooter({ text: 'ИГРАЕМ ВМЕСТЕ', iconURL: interaction.guild.iconURL() })
                .setTimestamp();
            
            await interaction.reply({ embeds: [dailyEmbed] });
        }

        // ==================== /PREMIUM ====================
        if (commandName === 'premium') {
            if (!interaction.member.roles.cache.has(CONFIG.PREMIUM_ROLE_ID)) {
                return interaction.reply({ content: '❌ Эта команда доступна только для владельцев **💎 Premium** роли!\n💡 Купите её в магазине: `/shop`', ephemeral: true });
            }
            
            const user = getUserData(interaction.user.id);
            const now = Date.now();
            const lastPremium = user.lastPremium || 0;
            const cooldown = 12 * 60 * 60 * 1000;
            
            if (now - lastPremium < cooldown) {
                const timeLeft = cooldown - (now - lastPremium);
                const hours = Math.floor(timeLeft / (60 * 60 * 1000));
                const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
                
                return interaction.reply({ content: `⏰ Вы уже получили Premium награду! Возвращайтесь через **${hours}ч ${minutes}м**`, ephemeral: true });
            }
            
            let reward = 50;
            
            if (interaction.member.roles.cache.has(CONFIG.VIP_ROLE_ID)) {
                reward *= 2;
            }
            
            user.coins += reward;
            user.lastPremium = now;
            await saveToCloud();
            
            const premiumEmbed = new EmbedBuilder()
                .setColor(COLORS.PURPLE)
                .setTitle('💎 Premium награда получена!')
                .setDescription(
                    `Вы получили **${reward} монет**!\n\n` +
                    `💰 Текущий баланс: **${user.coins} монет**\n\n` +
                    (interaction.member.roles.cache.has(CONFIG.VIP_ROLE_ID) ? '👑 **VIP буст x2 активен!**\n\n' : '') +
                    `⏰ Следующая награда через **12 часов**`
                )
                .setFooter({ text: 'ИГРАЕМ ВМЕСТЕ • Premium', iconURL: interaction.guild.iconURL() })
                .setTimestamp();
            
            await interaction.reply({ embeds: [premiumEmbed] });
        }

        // ==================== /OLDTIMER ====================
        if (commandName === 'oldtimer') {
            if (!interaction.member.roles.cache.has(CONFIG.OLDTIMER_ROLE_ID)) {
                return interaction.reply({ content: '❌ Эта команда доступна только для владельцев **🏆 Старичок** роли!\n💡 Купите её в магазине: `/shop`', ephemeral: true });
            }
            
            const user = getUserData(interaction.user.id);
            const now = Date.now();
            const lastOldtimer = user.lastOldtimer || 0;
            const cooldown = 24 * 60 * 60 * 1000;
            
            if (now - lastOldtimer < cooldown) {
                const timeLeft = cooldown - (now - lastOldtimer);
                const hours = Math.floor(timeLeft / (60 * 60 * 1000));
                const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
                
                return interaction.reply({ content: `⏰ Вы уже получили награду Старичка! Возвращайтесь через **${hours}ч ${minutes}м**`, ephemeral: true });
            }
            
            let reward = 150;
            
            if (interaction.member.roles.cache.has(CONFIG.VIP_ROLE_ID)) {
                reward *= 2;
            }
            
            user.coins += reward;
            user.lastOldtimer = now;
            await saveToCloud();
            
            const oldtimerEmbed = new EmbedBuilder()
                .setColor(COLORS.GOLD)
                .setTitle('🏆 Награда Старичка получена!')
                .setDescription(
                    `Вы получили **${reward} монет**!\n\n` +
                    `💰 Текущий баланс: **${user.coins} монет**\n\n` +
                    (interaction.member.roles.cache.has(CONFIG.VIP_ROLE_ID) ? '👑 **VIP буст x2 активен!**\n\n' : '') +
                    `⏰ Следующая награда через **24 часа**`
                )
                .setFooter({ text: 'ИГРАЕМ ВМЕСТЕ • Старичок', iconURL: interaction.guild.iconURL() })
                .setTimestamp();
            
            await interaction.reply({ embeds: [oldtimerEmbed] });
        }

        // ==================== /BALANCE ====================
        if (commandName === 'balance') {
            const user = getUserData(interaction.user.id);
            
            const balanceEmbed = new EmbedBuilder()
                .setColor(COLORS.GOLD)
                .setTitle('💰 Ваш баланс')
                .setDescription(
                    `**Монеты:** ${user.coins} 🪙\n` +
                    `**Банк:** ${user.bank} 🏦\n` +
                    `**Уровень:** ${user.level} ⭐\n\n` +
                    `Используйте \`/shop\` для покупок!`
                )
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: 'ИГРАЕМ ВМЕСТЕ', iconURL: interaction.guild.iconURL() })
                .setTimestamp();
            
            await interaction.reply({ embeds: [balanceEmbed] });
        }

        // ==================== /TRANSFER ====================
        if (commandName === 'transfer') {
            const target = interaction.options.getUser('user');
            const amount = interaction.options.getInteger('amount');
            
            if (!target || !amount || amount <= 0) {
                return interaction.reply({ content: '❌ Неверные параметры.', ephemeral: true });
            }
            
            const from = getUserData(interaction.user.id);
            const to = getUserData(target.id);
            
            if (from.coins < amount) {
                return interaction.reply({ content: '❌ Недостаточно монет.', ephemeral: true });
            }
            
            from.coins -= amount;
            to.coins += amount;
            await saveToCloud();
            
            await interaction.reply({ content: `✅ ${interaction.user.tag} передал ${amount} монет ${target.tag}.` });
            await logModAction(interaction.guild, `💸 ${interaction.user.tag} передал ${amount} монет ${target.tag}`);
        }

        // ==================== /BANK ====================
        if (commandName === 'bank') {
            const sub = interaction.options.getSubcommand();
            const user = getUserData(interaction.user.id);
            
            if (sub === 'deposit') {
                const amount = interaction.options.getInteger('amount');
                if (!amount || amount <= 0 || user.coins < amount) {
                    return interaction.reply({ content: '❌ Неверная сумма или недостаточно монет.', ephemeral: true });
                }
                user.coins -= amount; 
                user.bank += amount; 
                await saveToCloud();
                return interaction.reply({ content: `✅ Вы положили ${amount} в банк. Баланс в банке: ${user.bank} монет.` });
            }
            
            if (sub === 'withdraw') {
                const amount = interaction.options.getInteger('amount');
                if (!amount || amount <= 0 || user.bank < amount) {
                    return interaction.reply({ content: '❌ Неверная сумма или недостаточно средств в банке.', ephemeral: true });
                }
                user.bank -= amount; 
                user.coins += amount; 
                await saveToCloud();
                return interaction.reply({ content: `✅ Вы сняли ${amount} из банка. Остаток в банке: ${user.bank} монет.` });
            }
            
            if (sub === 'apply_interest') {
                if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                    return interaction.reply({ content: '❌ Только админы.', ephemeral: true });
                }
                const percent = interaction.options.getInteger('percent');
                if (!percent || percent <= 0) {
                    return interaction.reply({ content: '❌ Неверный процент.', ephemeral: true });
                }
                for (const [uid, u] of Object.entries(db.users)) {
                    if (u.bank && u.bank > 0) {
                        const gain = Math.floor(u.bank * (percent / 100));
                        u.bank += gain;
                    }
                }
                await saveToCloud();
                return interaction.reply({ content: `✅ Начислено ${percent}% на все банковские счета.` });
            }
        }

        // ==================== МОДЕРАЦИЯ: WARN / MUTE / UNMUTE / KICK / BAN / UNBAN ====================
        if (commandName === 'warn') {
            if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE_ID) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ Нет прав.', ephemeral: true });
            }
            const target = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason') || 'Не указана';
            const t = getUserData(target.id);
            t.warns.push({ moderator: interaction.user.id, reason, at: Date.now() });
            await saveToCloud();
            await interaction.reply({ content: `⚠️ ${target.tag} получил предупреждение: ${reason}` });
            await logModAction(interaction.guild, `⚠️ ${interaction.user.tag} выдал предупреждение ${target.tag}: ${reason}`);
        }

        if (commandName === 'mute') {
            if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE_ID) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ Нет прав.', ephemeral: true });
            }
            const target = interaction.options.getUser('user');
            const minutes = interaction.options.getInteger('minutes') || 10;
            const reason = interaction.options.getString('reason') || 'Не указана';
            const member = await interaction.guild.members.fetch(target.id).catch(()=>null);
            if (!member) return interaction.reply({ content: '❌ Пользователь не найден на сервере.', ephemeral: true });
            const role = await ensureMutedRole(interaction.guild);
            await member.roles.add(role, `Muted by ${interaction.user.tag} — ${reason}`);
            await interaction.reply({ content: `🔇 ${target.tag} замучен на ${minutes} минут. Причина: ${reason}` });
            await logModAction(interaction.guild, `🔇 ${interaction.user.tag} замутил ${target.tag} на ${minutes} минут. Причина: ${reason}`);
            setTimeout(async () => {
                try { if (member.roles.cache.has(role.id)) await member.roles.remove(role, 'Auto unmute'); } catch(e){}
            }, minutes * 60 * 1000);
        }

        if (commandName === 'unmute') {
            if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE_ID) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ Нет прав.', ephemeral: true });
            }
            const target = interaction.options.getUser('user');
            const member = await interaction.guild.members.fetch(target.id).catch(()=>null);
            if (!member) return interaction.reply({ content: '❌ Пользователь не найден', ephemeral: true });
            const role = interaction.guild.roles.cache.find(r => r.name === 'Muted');
            if (role && member.roles.cache.has(role.id)) await member.roles.remove(role, `Unmuted by ${interaction.user.tag}`);
            await interaction.reply({ content: `🔈 ${target.tag} размучен.` });
            await logModAction(interaction.guild, `🔈 ${interaction.user.tag} размутил ${target.tag}.`);
        }

        if (commandName === 'kick') {
            if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE_ID) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ Нет прав.', ephemeral: true });
            }
            const target = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason') || 'Не указана';
            const member = await interaction.guild.members.fetch(target.id).catch(()=>null);
            if (!member) return interaction.reply({ content: '❌ Пользователь не найден', ephemeral: true });
            await member.kick(reason).catch(()=>{});
            await interaction.reply({ content: `👢 ${target.tag} кикнут. Причина: ${reason}` });
            await logModAction(interaction.guild, `👢 ${interaction.user.tag} кикнул ${target.tag}: ${reason}`);
        }

        if (commandName === 'ban') {
            if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE_ID) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ Нет прав.', ephemeral: true });
            }
            const target = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason') || 'Не указана';
            const minutes = interaction.options.getInteger('minutes') || 0;
            await interaction.guild.members.ban(target.id, { reason }).catch(()=>{});
            if (minutes > 0) {
                await interaction.reply({ content: `⛔ ${target.tag} забанен на ${minutes} минут. Причина: ${reason}` });
                await logModAction(interaction.guild, `⛔ ${interaction.user.tag} забанил ${target.tag} на ${minutes} минут. Причина: ${reason}`);
                setTimeout(async () => {
                    try {
                        await interaction.guild.members.unban(target.id, 'Временный бан истёк');
                        await logModAction(interaction.guild, `🔓 ${target.tag} автоматически разбанен после истечения временного бана.`);
                    } catch (e) {}
                }, minutes * 60 * 1000);
            } else {
                await interaction.reply({ content: `⛔ ${target.tag} забанен. Причина: ${reason}` });
                await logModAction(interaction.guild, `⛔ ${interaction.user.tag} забанил ${target.tag}: ${reason}`);
            }
        }

        if (commandName === 'unban') {
            if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE_ID) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ Нет прав.', ephemeral: true });
            }
            const target = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason') || 'Не указана';
            try {
                await interaction.guild.members.unban(target.id, reason);
                await interaction.reply({ content: `🔓 ${target.tag} разбанен. Причина: ${reason}` });
                await logModAction(interaction.guild, `🔓 ${interaction.user.tag} разбанил ${target.tag}. Причина: ${reason}`);
            } catch (e) {
                await interaction.reply({ content: `❌ Не удалось разбанить пользователя: ${e.message}`, ephemeral: true });
            }
        }

        if (commandName === 'give') {
            if (!interaction.member.roles.cache.has(CONFIG.CREATOR_ROLE_ID) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ Нет прав.', ephemeral: true });
            }
            const target = interaction.options.getUser('user');
            const amount = interaction.options.getInteger('amount');
            if (!target || !amount || amount <= 0) {
                return interaction.reply({ content: '❌ Неверные параметры.', ephemeral: true });
            }
            const targetUser = getUserData(target.id);
            targetUser.coins += amount;
            await saveToCloud();
            await interaction.reply({ content: `✅ ${interaction.user.tag} выдал ${amount} монет ${target.tag}.` });
            await logModAction(interaction.guild, `💵 ${interaction.user.tag} выдал ${amount} монет ${target.tag}.`);
        }

        // ==================== /ADDEX ====================
        if (commandName === 'addex') {
            if (!interaction.member.roles.cache.has(CONFIG.CREATOR_ROLE_ID) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ Нет прав.', ephemeral: true });
            }
            const target = interaction.options.getUser('user');
            const amount = interaction.options.getInteger('amount');
            if (!target || !amount || amount <= 0) {
                return interaction.reply({ content: '❌ Неверные параметры.', ephemeral: true });
            }
            const targetUser = getUserData(target.id);
            const oldLevel = targetUser.level;
            targetUser.xp += amount;
            targetUser.level = calculateLevel(targetUser.xp);
            await saveToCloud();
            const levelUpMsg = targetUser.level > oldLevel ? ` (Повышение до уровня ${targetUser.level})` : '';
            await interaction.reply({ content: `✅ ${interaction.user.tag} добавил ${amount} XP ${target.tag}.${levelUpMsg}` });
            await logModAction(interaction.guild, `⭐ ${interaction.user.tag} добавил ${amount} XP ${target.tag}.${levelUpMsg}`);
        }

        // ==================== /ADDLEVEL ====================
        if (commandName === 'addlevel') {
            if (!interaction.member.roles.cache.has(CONFIG.CREATOR_ROLE_ID) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ Нет прав.', ephemeral: true });
            }
            const target = interaction.options.getUser('user');
            const levels = interaction.options.getInteger('levels');
            if (!target || !levels || levels <= 0) {
                return interaction.reply({ content: '❌ Неверные параметры.', ephemeral: true });
            }
            const targetUser = getUserData(target.id);
            const oldLevel = targetUser.level;
            targetUser.level += levels;
            
            // Пересчитываем XP для нового уровня
            let totalXP = 0;
            for (let i = 1; i <= targetUser.level; i++) {
                totalXP += getRequiredXP(i);
            }
            targetUser.xp = totalXP;
            
            await saveToCloud();
            await interaction.reply({ content: `✅ ${interaction.user.tag} добавил ${levels} уровней ${target.tag}. Новый уровень: ${targetUser.level}` });
            await logModAction(interaction.guild, `📈 ${interaction.user.tag} добавил ${levels} уровней ${target.tag}. (${oldLevel} → ${targetUser.level})`);
        }

        // ==================== /SHOP ====================
        if (commandName === 'shop') {
            let description = '**Доступные товары:**\n\n';
            
            SHOP_ITEMS.forEach((item, index) => {
                description += `**${index + 1}.** ${item.emoji} **${item.name}**\n`;
                description += `   ${item.description}\n`;
                description += `   💰 Цена: **${item.price} монет**\n\n`;
            });
            
            description += '\n💡 Используйте кнопки ниже для покупки!';
            
            const shopEmbed = new EmbedBuilder()
                .setColor(COLORS.PURPLE)
                .setTitle('🛒 Магазин ИГРАЕМ ВМЕСТЕ')
                .setDescription(description)
                .setImage(GIFS.SHOP)
                .setFooter({ text: 'ИГРАЕМ ВМЕСТЕ', iconURL: interaction.guild.iconURL() })
                .setTimestamp();
            
            const buttons = [];
            for (let i = 0; i < Math.min(SHOP_ITEMS.length, 5); i++) {
                buttons.push(
                    new ButtonBuilder()
                        .setCustomId(`shop_buy_${SHOP_ITEMS[i].id}`)
                        .setLabel(`${SHOP_ITEMS[i].name}`)
                        .setEmoji(SHOP_ITEMS[i].emoji)
                        .setStyle(ButtonStyle.Primary)
                );
            }
            
            const row = new ActionRowBuilder().addComponents(buttons);
            
            await interaction.reply({ embeds: [shopEmbed], components: [row] });
        }

        // ==================== /INVENTORY ====================
        if (commandName === 'inventory') {
            const user = getUserData(interaction.user.id);
            
            let description = '**Ваши покупки:**\n\n';
            
            if (user.inventory.length === 0) {
                description = 'Ваш инвентарь пуст. Посетите `/shop` для покупок!';
            } else {
                user.inventory.forEach(item => {
                    const shopItem = SHOP_ITEMS.find(si => si.id === item.id);
                    if (shopItem) {
                        description += `${shopItem.emoji} **${shopItem.name}**\n`;
                        description += `   Куплено: <t:${Math.floor(item.purchasedAt / 1000)}:R>\n\n`;
                    }
                });
            }
            
            const invEmbed = new EmbedBuilder()
                .setColor(COLORS.PRIMARY)
                .setTitle('🎒 Ваш инвентарь')
                .setDescription(description)
                .setFooter({ text: 'ИГРАЕМ ВМЕСТЕ', iconURL: interaction.guild.iconURL() })
                .setTimestamp();
            
            await interaction.reply({ embeds: [invEmbed] });
        }

        // ==================== /YOUTUBE ====================
        if (commandName === 'youtube') {
            const youtubeEmbed = new EmbedBuilder()
                .setColor(COLORS.YOUTUBE)
                .setTitle('📺 YouTube Канал - ИГРАЕМ ВМЕСТЕ')
                .setDescription(
                    `**Подписывайся на наш канал!** 🎬\n\n` +
                    `🎮 Игровые прохождения\n` +
                    `🔴 Стримы и прямые эфиры\n` +
                    `💡 Интересный контент\n` +
                    `🤝 Общение с подписчиками\n\n` +
                    `**🔔 Не забудь включить уведомления!**\n\n` +
                    `👉 [ПОДПИСАТЬСЯ](${CONFIG.YOUTUBE_CHANNEL})`
                )
                .setImage(GIFS.YOUTUBE_PROMO)
                .setFooter({ text: 'Спасибо за поддержку!', iconURL: interaction.guild.iconURL() })
                .setTimestamp();
            
            await interaction.reply({ embeds: [youtubeEmbed] });
        }

        // ==================== /INFO ====================
        if (commandName === 'info') {
            const serverEmbed = new EmbedBuilder()
                .setColor(COLORS.YOUTUBE)
                .setTitle('📊 Информация о сервере')
                .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 512 }))
                .setDescription(`**Официальный Discord сервера канала ИГРАЕМ ВМЕСТЕ** 🎮`)
                .addFields(
                    { name: '👥 Участников', value: `${interaction.guild.memberCount}`, inline: true },
                    { name: '📅 Создан', value: `<t:${Math.floor(interaction.guild.createdTimestamp / 1000)}:R>`, inline: true },
                    { name: '👑 Владелец', value: `<@${interaction.guild.ownerId}>`, inline: true },
                    { name: '📺 YouTube', value: `[Перейти на канал](${CONFIG.YOUTUBE_CHANNEL})`, inline: false }
                )
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                .setTimestamp();
            
            await interaction.reply({ embeds: [serverEmbed] });
        }

        // ==================== /RULES ====================
        if (commandName === 'rules') {
            const rulesEmbed = new EmbedBuilder()
                .setColor(COLORS.YOUTUBE)
                .setTitle('📜 Правила сервера ИГРАЕМ ВМЕСТЕ')
                .setDescription(
                    `**1️⃣ Уважение к участникам**\n` +
                    `Запрещены оскорбления, токсичность, дискриминация и притеснения любого рода.\n\n` +
                    `**2️⃣ Без спама и флуда**\n` +
                    `Не спамьте сообщениями, упоминаниями, эмодзи или стикерами.\n\n` +
                    `**3️⃣ Адекватное общение**\n` +
                    `Ведите себя культурно, используйте соответствующие каналы по назначению.\n\n` +
                    `**4️⃣ Запрет рекламы**\n` +
                    `Реклама других серверов/каналов без разрешения администрации запрещена.\n\n` +
                    `**5️⃣ Конфиденциальность**\n` +
                    `Не распространяйте личную информацию других участников.\n\n` +
                    `**6️⃣ Соблюдайте Discord ToS**\n` +
                    `Следуйте правилам Discord и законодательству.\n\n` +
                    `**7️⃣ Слушайте администрацию**\n` +
                    `Решения модераторов и админов окончательны.\n\n` +
                    `⚠️ **Нарушение правил ведёт к предупреждению, мьюту или бану!**`
                )
                .setFooter({ text: 'Соблюдайте правила и наслаждайтесь общением!', iconURL: interaction.guild.iconURL() })
                .setTimestamp();
            
            await interaction.reply({ embeds: [rulesEmbed] });
        }

        // ==================== /ROOM ====================
        if (commandName === 'room') {
            if (!interaction.guild) return interaction.reply({ content: '❌ Команда должна использоваться на сервере.', ephemeral: true });
            const sub = interaction.options.getSubcommand();
            const vc = interaction.member.voice.channel;
            if (!vc) return interaction.reply({ content: '❌ Вы должны находиться в голосовом канале для управления им.', ephemeral: true });
            if (!db.tempVoiceRooms[vc.id]) return interaction.reply({ content: '❌ Эта команда работает только для временных комнат, созданных ботом.', ephemeral: true });

            const ownerId = db.tempVoiceRooms[vc.id].owner;
            const isOwner = interaction.user.id === ownerId;
            const isStaff = interaction.member.roles.cache.has(CONFIG.STAFF_ROLE_ID) || interaction.member.permissions.has(PermissionFlagsBits.Administrator);
            if (!isOwner && !isStaff) return interaction.reply({ content: '❌ Только владелец комнаты или модерация могут управлять этой командой.', ephemeral: true });

            try {
                if (sub === 'lock') {
                    await vc.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: false });
                    await interaction.reply({ content: `🔒 Комната **${vc.name}** заблокирована.` });
                    await logModAction(interaction.guild, `🔒 ${interaction.user.tag} заблокировал комнату ${vc.name}`);
                    return;
                }

                if (sub === 'unlock') {
                    await vc.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: null });
                    await interaction.reply({ content: `🔓 Комната **${vc.name}** разблокирована.` });
                    await logModAction(interaction.guild, `🔓 ${interaction.user.tag} разблокировал комнату ${vc.name}`);
                    return;
                }

                if (sub === 'rename') {
                    const name = interaction.options.getString('name');
                    await vc.setName(name).catch(()=>{});
                    await interaction.reply({ content: `✏️ Комната переименована в **${name}**.` });
                    await logModAction(interaction.guild, `✏️ ${interaction.user.tag} переименовал комнату в: ${name}`);
                    return;
                }

                if (sub === 'limit') {
                    const size = interaction.options.getInteger('size');
                    await vc.setUserLimit(size).catch(()=>{});
                    await interaction.reply({ content: `🔢 Лимит участников установлен: **${size}**.` });
                    await logModAction(interaction.guild, `🔢 ${interaction.user.tag} установил лимит ${size} в комнате ${vc.name}`);
                    return;
                }

                if (sub === 'claim') {
                    db.tempVoiceRooms[vc.id].owner = interaction.user.id;
                    await saveToCloud();
                    await interaction.reply({ content: `🤝 Вы теперь владеете комнатой **${vc.name}**.` });
                    await logModAction(interaction.guild, `🤝 ${interaction.user.tag} забрал(а) владение комнатой ${vc.name}`);
                    return;
                }
            } catch (e) {
                console.error('room command error', e);
                return interaction.reply({ content: '❌ Произошла ошибка при выполнении команды.', ephemeral: true });
            }
        }
    }
    
    // ==================== ОБРАБОТКА КНОПОК ====================
    if (interaction.isButton()) {
        // ==================== ПОКУПКА В МАГАЗИНЕ ====================
        if (interaction.customId.startsWith('shop_buy_')) {
            const itemId = interaction.customId.replace('shop_buy_', '');
            const item = SHOP_ITEMS.find(i => i.id === itemId);
            const user = getUserData(interaction.user.id);

            if (!item) {
                return interaction.reply({ content: '❌ Товар не найден!', ephemeral: true });
            }

            if (user.coins < item.price) {
            return interaction.reply({ 
                content: `❌ Недостаточно монет!\n\n💰 У вас: **${user.coins}**\n💎 Нужно: **${item.price}**`, 
                ephemeral: true 
            });
        }
        
        if (user.inventory.some(i => i.id === itemId)) {
            return interaction.reply({ content: '❌ У вас уже есть этот товар!', ephemeral: true });
        }
        
        user.coins -= item.price;
        user.inventory.push({ id: itemId, purchasedAt: Date.now() });
        
        if (item.type === 'role' && item.roleId) {
            try {
                await interaction.member.roles.add(item.roleId);
            } catch (error) {
                user.coins += item.price;
                user.inventory.pop();
                return interaction.reply({ content: '❌ Ошибка выдачи роли!', ephemeral: true });
            }
        }
        
        await saveToCloud();
        
        const purchaseEmbed = new EmbedBuilder()
            .setColor(COLORS.SUCCESS)
            .setTitle('✅ Покупка успешна!')
            .setDescription(
                `Вы купили: ${item.emoji} **${item.name}**\n\n` +
                `${item.description}\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                `💰 Потрачено: **${item.price} монет**\n` +
                `💰 Осталось: **${user.coins} монет**\n\n` +
                `Спасибо за покупку! 🎉`
            )
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'ИГРАЕМ ВМЕСТЕ', iconURL: interaction.guild.iconURL() })
            .setTimestamp();
        
        await interaction.reply({ embeds: [purchaseEmbed], ephemeral: true });
    }

    // ==================== НАЧАЛО СОЗДАНИЯ ТИКЕТА ====================
    if (interaction.customId === 'start_ticket') {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_category')
            .setPlaceholder('Выберите категорию обращения')
            .addOptions(TICKET_CATEGORIES.map(cat => ({ 
                label: cat.label, 
                value: cat.value, 
                emoji: cat.emoji 
            })));

        await interaction.reply({ 
            components: [new ActionRowBuilder().addComponents(selectMenu)], 
            ephemeral: true 
        });
    }

    // ==================== ИНСТРУКЦИЯ ПО ГОЛОСОВЫМ КОМНАТАМ ====================
    if (interaction.customId === 'join_to_create_panel') {
        const guild = interaction.guild;
        const joinCh = guild.channels.cache.find(c => c.type === ChannelType.GuildVoice && c.name === 'Присоединиться для создания');
        
        if (!joinCh) {
            return interaction.reply({ 
                content: '❌ Канал "Присоединиться для создания" не найден. Администратор должен создать его через команду `!setup-voice`.', 
                ephemeral: true 
            });
        }
        
        const guideEmbed = new EmbedBuilder()
            .setColor(COLORS.PRIMARY)
            .setTitle('📖 Инструкция по использованию системы голосовых комнат')
            .setDescription(
                `**🎤 Как создать временную комнату:**\n\n` +
                `1. Подключитесь к каналу: **${joinCh.name}**\n` +
                `2. Бот автоматически создаст для вас приватную комнату с названием **Room - ВашеИмя**\n` +
                `3. Только вы (владелец) сможете управлять этой комнатой\n\n` +
                `**🎛️ Команды управления комнатой:**\n\n` +
                `**Способ 1: Слэш команды** (используйте в комнате)\n` +
                `\`/room lock\` - заблокировать доступ\n` +
                `\`/room unlock\` - разблокировать доступ\n` +
                `\`/room rename <имя>\` - переименовать\n` +
                `\`/room limit <число>\` - установить лимит участников\n` +
                `\`/room claim\` - забрать владение комнатой\n\n` +
                `**Способ 2: Кнопки** (используйте кнопки выше)\n` +
                `Просто нажимайте кнопки управления, находясь в целевой комнате\n\n` +
                `**⚠️ Важные правила:**\n` +
                `• Комната автоматически удалится, когда она станет пустой\n` +
                `• Управлять комнатой могут только владелец или администраторы\n` +
                `• Все действия записываются в логи\n` +
                `• Максимум характеров в названии: 100`
            )
            .setColor(COLORS.SUCCESS)
            .setFooter({ text: 'ИГРАЕМ ВМЕСТЕ • Справочная система', iconURL: guild.iconURL() })
            .setTimestamp();
        
        return interaction.reply({ embeds: [guideEmbed], ephemeral: true });
    }

    // ==================== УПРАВЛЕНИЕ ГОЛОСОВЫМИ КОМНАТАМИ ====================
    if (['vc_lock','vc_unlock','vc_rename','vc_limit','vc_claim'].includes(interaction.customId)) {
        const id = interaction.customId;
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && !interaction.member.roles.cache.has(CONFIG.STAFF_ROLE_ID)) {
            return interaction.reply({ content: '❌ Только администратор или Staff могут использовать эти кнопки.', ephemeral: true });
        }

        const memberVc = interaction.member.voice.channel;
        if (!memberVc) return interaction.reply({ content: '❌ Вы должны находиться в целевой голосовой комнате.', ephemeral: true });
        
        const room = db.tempVoiceRooms[memberVc.id];
        if (!room) return interaction.reply({ content: '❌ Целевая комната не является временной, созданной ботом.', ephemeral: true });

        try {
            if (id === 'vc_lock') {
                await memberVc.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: false });
                const lockEmbed = new EmbedBuilder()
                    .setColor(COLORS.DANGER)
                    .setTitle('🔒 Комната заблокирована')
                    .setDescription(`Комната **${memberVc.name}** теперь закрыта для новых пользователей.\n\n🔐 Только те, кто уже в комнате, могут остаться.`)
                    .setFooter({ text: 'Управление комнатами' })
                    .setTimestamp();
                await interaction.reply({ embeds: [lockEmbed], ephemeral: true });
                await logModAction(interaction.guild, `🔒 ${interaction.user.tag} ЗАБЛОКИРОВАЛ комнату **${memberVc.name}**`);
                return;
            }

            if (id === 'vc_unlock') {
                await memberVc.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: null });
                const unlockEmbed = new EmbedBuilder()
                    .setColor(COLORS.SUCCESS)
                    .setTitle('🔓 Комната разблокирована')
                    .setDescription(`Комната **${memberVc.name}** теперь открыта для всех.\n\n📋 Новые члены могут подключиться.`)
                    .setFooter({ text: 'Управление комнатами' })
                    .setTimestamp();
                await interaction.reply({ embeds: [unlockEmbed], ephemeral: true });
                await logModAction(interaction.guild, `🔓 ${interaction.user.tag} РАЗБЛОКИРОВАЛ комнату **${memberVc.name}**`);
                return;
            }

            if (id === 'vc_claim') {
                const oldOwner = room.owner;
                db.tempVoiceRooms[memberVc.id].owner = interaction.user.id;
                await saveToCloud();
                const claimEmbed = new EmbedBuilder()
                    .setColor(COLORS.PRIMARY)
                    .setTitle('🤝 Владение трансферировано')
                    .setDescription(`Вы теперь администратор комнаты **${memberVc.name}**.\n\n📋 Теперь вы можете управлять правами владения.`)
                    .setFooter({ text: 'Управление комнатами' })
                    .setTimestamp();
                await interaction.reply({ embeds: [claimEmbed], ephemeral: true });
                await logModAction(interaction.guild, `🤝 ${interaction.user.tag} СТАЛ НОВЫМ ВЛАДЕЛЬЦЕМ комнаты **${memberVc.name}** (Предыдущий владелец: <@${oldOwner}>)`);
                return;
            }

            if (id === 'vc_rename') {
                const modal = new ModalBuilder().setCustomId('vc_rename_modal').setTitle('✏️ Переименование комнаты');
                const nameInput = new TextInputBuilder()
                    .setCustomId('vc_new_name')
                    .setLabel('Новое имя комнаты (до 100 символов)')
                    .setPlaceholder('Например: Кодеры и Геймеры')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(100);
                modal.addComponents(new ActionRowBuilder().addComponents(nameInput));
                return interaction.showModal(modal);
            }

            if (id === 'vc_limit') {
                const modal = new ModalBuilder().setCustomId('vc_limit_modal').setTitle('🔢 Установка лимита участников');
                const sizeInput = new TextInputBuilder()
                    .setCustomId('vc_new_limit')
                    .setLabel('Максимум человек (0 = бесконечно)')
                    .setPlaceholder('Например: 5')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(3);
                modal.addComponents(new ActionRowBuilder().addComponents(sizeInput));
                return interaction.showModal(modal);
            }
        } catch (e) {
            console.error('vc control button error', e);
            return interaction.reply({ content: '❌ Ошибка при выполнении операции.', ephemeral: true });
        }
    }

    // ==================== КНОПКИ УПРАВЛЕНИЯ ТИКЕТАМИ ====================
    if (interaction.customId === 'accept_ticket') {
        if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE_ID)) {
            return interaction.reply({ content: '❌ У вас нет прав для выполнения этого действия.', ephemeral: true });
        }

        if (db.tickets[interaction.channel.id]) {
            db.tickets[interaction.channel.id].status = 'in_progress';
            db.tickets[interaction.channel.id].moderatorId = interaction.user.id;
            await saveToCloud();
        }

        const messages = await interaction.channel.messages.fetch({ limit: 10 });
        const mainMessage = messages.find(msg => 
            msg.embeds[0]?.title?.includes('Предложение по видео') || 
            msg.embeds[0]?.title?.includes('Сотрудничество') ||
            msg.embeds[0]?.title?.includes('Игровой вопрос') ||
            msg.embeds[0]?.title?.includes('Общий вопрос') ||
            msg.embeds[0]?.title?.includes('Техническая проблема') ||
            msg.embeds[0]?.title?.includes('Другое')
        );
        
        if (mainMessage) {
            const oldEmbed = mainMessage.embeds[0];
            const ticketNumber = oldEmbed.fields.find(f => f.name === '🎫 Номер тикета')?.value || '#0000';
            
            const updatedEmbed = EmbedBuilder.from(oldEmbed)
                .setColor('#10B981')
                .setFields(
                    { name: '🎫 Номер тикета', value: ticketNumber, inline: true },
                    { name: '📝 Категория', value: oldEmbed.fields.find(f => f.name === '📝 Категория')?.value || 'Неизвестно', inline: true },
                    { name: '🏆 Статус', value: '✅ Принят в работу', inline: true },
                    { name: '\u200b', value: '\u200b', inline: false },
                    { name: '👤 Создатель тикета', value: oldEmbed.fields.find(f => f.name === '👤 Создатель тикета')?.value || 'Неизвестно', inline: true },
                    { name: '📅 Дата создания', value: oldEmbed.fields.find(f => f.name === '📅 Дата создания')?.value || 'Неизвестно', inline: true },
                    { name: '🆔 ID пользователя', value: oldEmbed.fields.find(f => f.name === '🆔 ID пользователя')?.value || 'Неизвестно', inline: true }
                );

            await mainMessage.edit({ embeds: [updatedEmbed] });
        }

        const controlMessage = messages.find(msg => msg.embeds[0]?.title === '🎛️ Панель управления тикетом');
        if (controlMessage) {
            const oldControl = controlMessage.embeds[0];
            const ticketNumber = oldControl.fields.find(f => f.name === '🎫 Тикет')?.value || '#0000';
            
            const updatedControl = new EmbedBuilder()
                .setColor('#10B981')
                .setTitle('🎛️ Панель управления тикетом')
                .setDescription(
                    `**Информация о тикете:**\n\n` +
                    `📊 **Статус:** ✅ Принят в работу\n` +
                    `👨‍💼 **Модератор:** ${interaction.user}\n` +
                    `⏱️ **Время принятия:** <t:${Math.floor(Date.now() / 1000)}:R>\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `**Действия для команды:**\n` +
                    `✅ **Принять тикет** - взять тикет в работу\n` +
                    `🔄 **Передать тикет** - передать другому модератору\n` +
                    `🔒 **Закрыть тикет** - закрыть и удалить через 10 сек\n` +
                    `📝 **Закрыть с причиной** - указать причину закрытия`
                )
                .addFields(
                    { name: '👤 Создатель', value: oldControl.fields.find(f => f.name === '👤 Создатель')?.value || 'Неизвестно', inline: true },
                    { name: '📅 Создан', value: oldControl.fields.find(f => f.name === '📅 Создан')?.value || 'Неизвестно', inline: true },
                    { name: '🎫 Тикет', value: ticketNumber, inline: true }
                )
                .setFooter({ text: 'Тикет принят в работу', iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            await controlMessage.edit({ embeds: [updatedControl], components: controlMessage.components });
        }

        const logChannel = interaction.guild.channels.cache.get(CONFIG.LOG_CHANNEL_ID);
        if (logChannel) {
            const ticketNumber = interaction.channel.name.replace('ticket-', '#');
            const logEmbed = new EmbedBuilder()
                .setColor('#10B981')
                .setTitle('✅ Тикет принят в работу')
                .setDescription(
                    `**Модератор:** ${interaction.user} (\`${interaction.user.tag}\`)\n` +
                    `**ID модератора:** \`${interaction.user.id}\`\n` +
                    `**Тикет:** ${ticketNumber}\n` +
                    `**Канал:** ${interaction.channel}\n` +
                    `**Время:** <t:${Math.floor(Date.now() / 1000)}:F>`
                )
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: 'Система логирования тикетов', iconURL: interaction.guild.iconURL() })
                .setTimestamp();
            
            await logChannel.send({ embeds: [logEmbed] }).catch(err => console.error('Ошибка отправки лога:', err));
        }

        await interaction.reply({ content: `✅ **Тикет принят в работу модератором ${interaction.user}**\n📌 Обработка началась!`, ephemeral: false });
    }

    if (interaction.customId === 'transfer_ticket') {
        if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE_ID)) {
            return interaction.reply({ content: '❌ У вас нет прав для выполнения этого действия.', ephemeral: true });
        }
        await interaction.reply({ content: '🔄 Функция передачи тикета в разработке.', ephemeral: true });
    }

    if (interaction.customId === 'close_ticket_lock' || interaction.customId === 'close_ticket') {
        if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE_ID)) {
            return interaction.reply({ content: '❌ У вас нет прав для выполнения этого действия.', ephemeral: true });
        }
        
        if (db.tickets[interaction.channel.id]) {
            db.tickets[interaction.channel.id].status = 'closed';
            db.tickets[interaction.channel.id].closedAt = new Date().toISOString();
            await saveToCloud();
        }

        const closeEmbed = new EmbedBuilder()
            .setColor(COLORS.DANGER)
            .setTitle('🔒 Тикет закрывается')
            .setDescription(
                `**Тикет закрыт модератором ${interaction.user}**\n\n` +
                `Канал будет удалён через **10 секунд**.\n` +
                `Спасибо за обращение! Надеемся, мы помогли вам! 🎮`
            )
            .setFooter({ text: 'ИГРАЕМ ВМЕСТЕ Support', iconURL: interaction.guild.iconURL() })
            .setTimestamp();
        
        await interaction.reply({ embeds: [closeEmbed] });
        
        const logChannel = interaction.guild.channels.cache.get(CONFIG.LOG_CHANNEL_ID);
        if (logChannel) {
            const ticketNumber = interaction.channel.name.replace('ticket-', '#');
            const logEmbed = new EmbedBuilder()
                .setColor('#EF4444')
                .setTitle('🔒 Тикет закрыт')
                .setDescription(
                    `**Модератор:** ${interaction.user} (\`${interaction.user.tag}\`)\n` +
                    `**ID модератора:** \`${interaction.user.id}\`\n` +
                    `**Тикет:** ${ticketNumber}\n` +
                    `**Канал:** ${interaction.channel.name}\n` +
                    `**Причина:** Закрыт модератором\n` +
                    `**Время:** <t:${Math.floor(Date.now() / 1000)}:F>`
                )
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: 'Система логирования тикетов', iconURL: interaction.guild.iconURL() })
                .setTimestamp();
            
            await logChannel.send({ embeds: [logEmbed] }).catch(err => console.error('Ошибка отправки лога:', err));
        }
        
        setTimeout(() => {
            delete db.tickets[interaction.channel.id];
            saveToCloud();
            interaction.channel.delete().catch(() => {});
        }, 10000);
    }

    if (interaction.customId === 'close_with_reason') {
        if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE_ID)) {
            return interaction.reply({ content: '❌ У вас нет прав для выполнения этого действия.', ephemeral: true });
        }
        await interaction.reply({ content: '📝 **Укажите причину закрытия в следующем сообщении**\n⏱️ У вас есть 60 секунд:', ephemeral: true });

        const filter = m => m.author.id === interaction.user.id;
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }).catch(() => null);

        if (collected) {
            const reason = collected.first().content;
            
            if (db.tickets[interaction.channel.id]) {
                db.tickets[interaction.channel.id].status = 'closed';
                db.tickets[interaction.channel.id].closedAt = new Date().toISOString();
                await saveToCloud();
            }

            const closeEmbed = new EmbedBuilder()
                .setColor(COLORS.DANGER)
                .setTitle('🔒 Тикет закрыт с причиной')
                .setDescription(
                    `**Модератор:** ${interaction.user}\n\n` +
                    `**📝 Причина закрытия:**\n${reason}\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `Канал будет удалён через **10 секунд**.\n` +
                    `Спасибо за обращение! Надеемся, мы помогли вам! 🎮`
                )
                .setFooter({ text: 'ИГРАЕМ ВМЕСТЕ Support', iconURL: interaction.guild.iconURL() })
                .setTimestamp();
            
            await interaction.channel.send({ embeds: [closeEmbed] });
            
            const logChannel = interaction.guild.channels.cache.get(CONFIG.LOG_CHANNEL_ID);
            if (logChannel) {
                const ticketNumber = interaction.channel.name.replace('ticket-', '#');
                const logEmbed = new EmbedBuilder()
                    .setColor('#EF4444')
                    .setTitle('🔒 Тикет закрыт с причиной')
                    .setDescription(
                        `**Модератор:** ${interaction.user} (\`${interaction.user.tag}\`)\n` +
                        `**ID модератора:** \`${interaction.user.id}\`\n` +
                        `**Тикет:** ${ticketNumber}\n` +
                        `**Канал:** ${interaction.channel.name}\n` +
                        `**Причина:** ${reason}\n` +
                        `**Время:** <t:${Math.floor(Date.now() / 1000)}:F>`
                    )
                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: 'Система логирования тикетов', iconURL: interaction.guild.iconURL() })
                    .setTimestamp();
                
                await logChannel.send({ embeds: [logEmbed] }).catch(err => console.error('Ошибка отправки лога:', err));
            }
            
            setTimeout(() => {
                delete db.tickets[interaction.channel.id];
                saveToCloud();
                interaction.channel.delete().catch(() => {});
            }, 10000);
        }
    }
}

// ==================== ВЫБОР КАТЕГОРИИ ТИКЕТА ====================
if (interaction.isStringSelectMenu() && interaction.customId === 'select_category') {
    const categoryValue = interaction.values[0];
    const category = TICKET_CATEGORIES.find(c => c.value === categoryValue);
    
    let modal;
    
    if (categoryValue === 'video_idea') {
        modal = new ModalBuilder()
            .setCustomId('modal_video_idea')
            .setTitle('🎬 Предложение по видео');
        
        const ideaInput = new TextInputBuilder()
            .setCustomId('idea')
            .setLabel('Ваша идея для видео')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Опишите подробно вашу идею...')
            .setRequired(true)
            .setMaxLength(1000);
        
        const gameInput = new TextInputBuilder()
            .setCustomId('game')
            .setLabel('Игра (если применимо)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Название игры...')
            .setRequired(false)
            .setMaxLength(100);
        
        const formatInput = new TextInputBuilder()
            .setCustomId('format')
            .setLabel('Формат видео')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Прохождение, обзор, гайд, летсплей...')
            .setRequired(false)
            .setMaxLength(100);
        
        const detailsInput = new TextInputBuilder()
            .setCustomId('details')
            .setLabel('Дополнительные детали')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Что ещё важно знать?')
            .setRequired(false)
            .setMaxLength(500);
        
        modal.addComponents(
            new ActionRowBuilder().addComponents(ideaInput),
            new ActionRowBuilder().addComponents(gameInput),
            new ActionRowBuilder().addComponents(formatInput),
            new ActionRowBuilder().addComponents(detailsInput)
        );
    }
    else if (categoryValue === 'collaboration') {
        modal = new ModalBuilder()
            .setCustomId('modal_collaboration')
            .setTitle('🤝 Сотрудничество');
        
        const typeInput = new TextInputBuilder()
            .setCustomId('type')
            .setLabel('Тип сотрудничества')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Реклама, коллаборация, спонсорство...')
            .setRequired(true)
            .setMaxLength(100);
        
        const descInput = new TextInputBuilder()
            .setCustomId('description')
            .setLabel('Описание предложения')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Подробно опишите ваше предложение...')
            .setRequired(true)
            .setMaxLength(1000);
        
        const contactInput = new TextInputBuilder()
            .setCustomId('contact')
            .setLabel('Контакты для связи')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Email, Telegram, Discord...')
            .setRequired(true)
            .setMaxLength(200);
        
        const budgetInput = new TextInputBuilder()
            .setCustomId('budget')
            .setLabel('Бюджет (если применимо)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Укажите бюджет или напишите "договорная"')
            .setRequired(false)
            .setMaxLength(100);
        
        modal.addComponents(
            new ActionRowBuilder().addComponents(typeInput),
            new ActionRowBuilder().addComponents(descInput),
            new ActionRowBuilder().addComponents(contactInput),
            new ActionRowBuilder().addComponents(budgetInput)
        );
    }
    else if (categoryValue === 'gaming') {
        modal = new ModalBuilder()
            .setCustomId('modal_gaming')
            .setTitle('🎮 Игровой вопрос');
        
        const gameInput = new TextInputBuilder()
            .setCustomId('game')
            .setLabel('Название игры')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('О какой игре вопрос?')
            .setRequired(true)
            .setMaxLength(100);
        
        const questionInput = new TextInputBuilder()
            .setCustomId('question')
            .setLabel('Ваш вопрос')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Задайте ваш вопрос подробно...')
            .setRequired(true)
            .setMaxLength(1000);
        
        const platformInput = new TextInputBuilder()
            .setCustomId('platform')
            .setLabel('Платформа')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('PC, PS5, Xbox, Nintendo Switch...')
            .setRequired(false)
            .setMaxLength(50);
        
        const urgencyInput = new TextInputBuilder()
            .setCustomId('urgency')
            .setLabel('Срочность')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Не срочно, средняя, срочно')
            .setRequired(false)
            .setMaxLength(20);
        
        modal.addComponents(
            new ActionRowBuilder().addComponents(gameInput),
            new ActionRowBuilder().addComponents(questionInput),
            new ActionRowBuilder().addComponents(platformInput),
            new ActionRowBuilder().addComponents(urgencyInput)
        );
    }
    else if (categoryValue === 'general') {
        modal = new ModalBuilder()
            .setCustomId('modal_general')
            .setTitle('💬 Общий вопрос');
        
        const topicInput = new TextInputBuilder()
            .setCustomId('topic')
            .setLabel('Тема вопроса')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Кратко укажите тему...')
            .setRequired(true)
            .setMaxLength(100);
        
        const questionInput = new TextInputBuilder()
            .setCustomId('question')
            .setLabel('Ваш вопрос')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Опишите ваш вопрос подробно...')
            .setRequired(true)
            .setMaxLength(1000);
        
        const contextInput = new TextInputBuilder()
            .setCustomId('context')
            .setLabel('Дополнительная информация')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Любая дополнительная информация...')
            .setRequired(false)
            .setMaxLength(500);
        
        modal.addComponents(
            new ActionRowBuilder().addComponents(topicInput),
            new ActionRowBuilder().addComponents(questionInput),
            new ActionRowBuilder().addComponents(contextInput)
        );
    }
    else if (categoryValue === 'technical') {
        modal = new ModalBuilder()
            .setCustomId('modal_technical')
            .setTitle('🐛 Техническая проблема');
        
        const problemInput = new TextInputBuilder()
            .setCustomId('problem')
            .setLabel('Опишите проблему')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Что именно не работает?')
            .setRequired(true)
            .setMaxLength(1000);
        
        const whereInput = new TextInputBuilder()
            .setCustomId('where')
            .setLabel('Где возникла проблема?')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Discord, сайт, игра, другое...')
            .setRequired(true)
            .setMaxLength(100);
        
        const stepsInput = new TextInputBuilder()
            .setCustomId('steps')
            .setLabel('Что вы уже пробовали?')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Перезагрузка, переустановка и т.д...')
            .setRequired(false)
            .setMaxLength(500);
        
        const errorInput = new TextInputBuilder()
            .setCustomId('error')
            .setLabel('Текст ошибки (если есть)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Скопируйте текст ошибки...')
            .setRequired(false)
            .setMaxLength(200);
        
        modal.addComponents(
            new ActionRowBuilder().addComponents(problemInput),
            new ActionRowBuilder().addComponents(whereInput),
            new ActionRowBuilder().addComponents(stepsInput),
            new ActionRowBuilder().addComponents(errorInput)
        );
    }
    else if (categoryValue === 'other') {
        modal = new ModalBuilder()
            .setCustomId('modal_other')
            .setTitle('📋 Другое');
        
        const topicInput = new TextInputBuilder()
            .setCustomId('topic')
            .setLabel('Тема обращения')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Кратко укажите тему...')
            .setRequired(true)
            .setMaxLength(100);
        
        const messageInput = new TextInputBuilder()
            .setCustomId('message')
            .setLabel('Ваше сообщение')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Опишите подробно...')
            .setRequired(true)
            .setMaxLength(1000);
        
        const contactInput = new TextInputBuilder()
            .setCustomId('contact')
            .setLabel('Контакты (если нужно)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Email, Telegram и т.д.')
            .setRequired(false)
            .setMaxLength(150);
        
        modal.addComponents(
            new ActionRowBuilder().addComponents(topicInput),
            new ActionRowBuilder().addComponents(messageInput),
            new ActionRowBuilder().addComponents(contactInput)
        );
    }
    
    await interaction.showModal(modal);
}

// ==================== ОБРАБОТКА МОДАЛЬНЫХ ОКОН ====================
if (interaction.isModalSubmit()) {
    // ==================== МОДАЛЫ ГОЛОСОВЫХ КОМНАТ ====================
    if (interaction.customId === 'vc_rename_modal') {
        const newName = interaction.fields.getTextInputValue('vc_new_name');
        const vc = interaction.member?.voice?.channel;
        
        if (!vc) {
            return interaction.reply({ content: '❌ Вы не находитесь в голосовом канале для выполнения этой операции.', ephemeral: true });
        }
        
        const room = db.tempVoiceRooms[vc.id];
        if (!room) {
            return interaction.reply({ content: '❌ Эта команда работает только для временных комнат, созданных ботом через панель управления.', ephemeral: true });
        }
        
        await vc.setName(newName).catch(()=>{});
        
        const renameEmbed = new EmbedBuilder()
            .setColor(COLORS.SUCCESS)
            .setTitle('✏️ Комната успешно переименована')
            .setDescription(`**Новое имя:** ${newName}\n\n✅ Все участники видят новое имя в реальном времени.`)
            .setFooter({ text: 'Управление комнатами' })
            .setTimestamp();
        
        await interaction.reply({ embeds: [renameEmbed], ephemeral: true });
        await logModAction(interaction.guild, `✏️ ${interaction.user.tag} ПЕРЕИМЕНОВАЛ комнату в: **${newName}**`);
        return;
    }
    
    if (interaction.customId === 'vc_limit_modal') {
        const val = interaction.fields.getTextInputValue('vc_new_limit');
        const size = parseInt(val) || 0;
        const vc = interaction.member?.voice?.channel;
        
        if (!vc) {
            return interaction.reply({ content: '❌ Вы не находитесь в голосовом канале для выполнения этой операции.', ephemeral: true });
        }
        
        const room = db.tempVoiceRooms[vc.id];
        if (!room) {
            return interaction.reply({ content: '❌ Эта команда работает только для временных комнат, созданных ботом через панель управления.', ephemeral: true });
        }
        
        if (size < 0 || size > 99) {
            return interaction.reply({ content: '❌ Лимит должен быть от 0 до 99 человек.', ephemeral: true });
        }
        
        await vc.setUserLimit(size === 0 ? 0 : size).catch(()=>{});
        
        const limitEmbed = new EmbedBuilder()
            .setColor(COLORS.SUCCESS)
            .setTitle('🔢 Лимит участников установлен')
            .setDescription(`**Максимум человек:** ${size === 0 ? 'Бесконечно' : size}\n\n${size === 0 ? '🟢 Комната открыта для всех' : `🟡 Максимум ${size} участников одновременно`}`)
            .setFooter({ text: 'Управление комнатами' })
            .setTimestamp();
        
        await interaction.reply({ embeds: [limitEmbed], ephemeral: true });
        await logModAction(interaction.guild, `🔢 ${interaction.user.tag} УСТАНОВИЛ ЛИМИТ ${size === 0 ? 'без лимита' : size + ' человек'} в комнате **${vc.name}**`);
        return;
    }

    // ==================== МОДАЛЫ ТИКЕТОВ ====================
    await interaction.deferReply({ ephemeral: true });
    
    let category, categoryLabel, categoryEmoji, formData = {};
    
    if (interaction.customId === 'modal_video_idea') {
        category = TICKET_CATEGORIES.find(c => c.value === 'video_idea');
        categoryLabel = category.label;
        categoryEmoji = category.emoji;
        formData = {
            'Идея для видео': interaction.fields.getTextInputValue('idea'),
            'Игра': interaction.fields.getTextInputValue('game') || 'Не указано',
            'Формат видео': interaction.fields.getTextInputValue('format') || 'Не указано',
            'Дополнительные детали': interaction.fields.getTextInputValue('details') || 'Нет'
        };
    }
    else if (interaction.customId === 'modal_collaboration') {
        category = TICKET_CATEGORIES.find(c => c.value === 'collaboration');
        categoryLabel = category.label;
        categoryEmoji = category.emoji;
        formData = {
            'Тип сотрудничества': interaction.fields.getTextInputValue('type'),
            'Описание предложения': interaction.fields.getTextInputValue('description'),
            'Контакты': interaction.fields.getTextInputValue('contact'),
            'Бюджет': interaction.fields.getTextInputValue('budget') || 'Не указано'
        };
    }
    else if (interaction.customId === 'modal_gaming') {
        category = TICKET_CATEGORIES.find(c => c.value === 'gaming');
        categoryLabel = category.label;
        categoryEmoji = category.emoji;
        formData = {
            'Игра': interaction.fields.getTextInputValue('game'),
            'Вопрос': interaction.fields.getTextInputValue('question'),
            'Платформа': interaction.fields.getTextInputValue('platform') || 'Не указано',
            'Срочность': interaction.fields.getTextInputValue('urgency') || 'Не указано'
        };
    }
    else if (interaction.customId === 'modal_general') {
        category = TICKET_CATEGORIES.find(c => c.value === 'general');
        categoryLabel = category.label;
        categoryEmoji = category.emoji;
        formData = {
            'Тема': interaction.fields.getTextInputValue('topic'),
            'Вопрос': interaction.fields.getTextInputValue('question'),
            'Дополнительная информация': interaction.fields.getTextInputValue('context') || 'Нет'
        };
    }
    else if (interaction.customId === 'modal_technical') {
        category = TICKET_CATEGORIES.find(c => c.value === 'technical');
        categoryLabel = category.label;
        categoryEmoji = category.emoji;
        formData = {
            'Проблема': interaction.fields.getTextInputValue('problem'),
            'Где возникла': interaction.fields.getTextInputValue('where'),
            'Что пробовали': interaction.fields.getTextInputValue('steps') || 'Ничего',
            'Текст ошибки': interaction.fields.getTextInputValue('error') || 'Нет'
        };
    }
    else if (interaction.customId === 'modal_other') {
        category = TICKET_CATEGORIES.find(c => c.value === 'other');
        categoryLabel = category.label;
        categoryEmoji = category.emoji;
        formData = {
            'Тема': interaction.fields.getTextInputValue('topic'),
            'Сообщение': interaction.fields.getTextInputValue('message'),
            'Контакты': interaction.fields.getTextInputValue('contact') || 'Не указано'
        };
    }
    
    // Если это тикет - создаем
    if (category) {
        db.ticketCounter++;
        const ticketNumber = db.ticketCounter.toString().padStart(4, '0');
        
        const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${ticketNumber}`,
            type: ChannelType.GuildText,
            parent: CONFIG.TICKET_CATEGORY_ID,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.ReadMessageHistory] },
                { id: CONFIG.STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
            ]
        });

        db.tickets[ticketChannel.id] = {
            number: ticketNumber,
            channelId: ticketChannel.id,
            userId: interaction.user.id,
            category: category.value,
            status: 'open',
            createdAt: new Date().toISOString(),
            moderatorId: null,
            closedAt: null
        };
        await saveToCloud();

        let formDescription = '';
        for (const [key, value] of Object.entries(formData)) {
            formDescription += `**${key}:**\n${value}\n\n`;
        }

        const welcomeEmbed = new EmbedBuilder()
            .setColor(COLORS.YOUTUBE)
            .setAuthor({ 
                name: `${interaction.guild.name} - Система поддержки`, 
                iconURL: interaction.guild.iconURL() 
            })
            .setTitle(`${categoryEmoji} ${categoryLabel}`)
            .setDescription(
                `👋 **Привет, ${interaction.user.username}!**\n\n` +
                `Спасибо за обращение! Ваш тикет успешно создан.\n` +
                `Наша команда поддержки свяжется с вами в ближайшее время.\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                `## 📋 Данные вашего обращения\n\n` +
                formDescription +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                `## ⚠️ Правила тикета\n\n` +
                `**Обязательно соблюдайте:**\n` +
                `❌ Не спамьте сообщениями\n` +
                `❌ Не упоминайте команду без необходимости\n` +
                `❌ Не создавайте дубликаты тикетов\n` +
                `✅ Будьте вежливы и терпеливы\n` +
                `✅ Предоставляйте полную информацию\n` +
                `✅ Соблюдайте правила сервера\n\n` +
                `⚡ **Важно:** Неадекватное поведение или спам приведёт к закрытию тикета и возможным санкциям.\n\n` +
                `Спасибо за понимание! Мы ценим ваше участие в сообществе! 🎮❤️`
            )
            .addFields(
                { name: '🎫 Номер тикета', value: `\`#${ticketNumber}\``, inline: true },
                { name: '📝 Категория', value: `${categoryEmoji} ${categoryLabel}`, inline: true },
                { name: '🏆 Статус', value: '⏳ Ожидает обработки', inline: true },
                { name: '\u200b', value: '\u200b', inline: false },
                { name: '👤 Создатель тикета', value: `${interaction.user}`, inline: true },
                { name: '📅 Дата создания', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '🆔 ID пользователя', value: `\`${interaction.user.id}\``, inline: true }
            )
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setFooter({ 
                text: `${interaction.guild.name} Support System • Тикет открыт`, 
                iconURL: interaction.guild.iconURL() 
            })
            .setTimestamp();

        const controlEmbed = new EmbedBuilder()
            .setColor('#2F3136')
            .setTitle('🎛️ Панель управления тикетом')
            .setDescription(
                `**Информация о тикете:**\n\n` +
                `📊 **Статус:** Ожидает обработки\n` +
                `👨‍💼 **Модератор:** Не назначен\n` +
                `⏱️ **Время ожидания:** <t:${Math.floor(Date.now() / 1000)}:R>\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                `**Действия для команды:**\n` +
                `✅ **Принять тикет** - взять тикет в работу\n` +
                `🔄 **Передать тикет** - передать другому модератору\n` +
                `🔒 **Закрыть тикет** - закрыть и удалить через 10 сек\n` +
                `📝 **Закрыть с причиной** - указать причину закрытия`
            )
            .addFields(
                { name: '👤 Создатель', value: `${interaction.user.tag}\n\`${interaction.user.id}\``, inline: true },
                { name: '📅 Создан', value: `<t:${Math.floor(Date.now() / 1000)}:f>`, inline: true },
                { name: '🎫 Тикет', value: `#${ticketNumber}`, inline: true }
            )
            .setFooter({ text: 'Используйте кнопки ниже для управления тикетом', iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        const buttons1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('accept_ticket')
                .setLabel('Принять тикет')
                .setEmoji('✅')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('transfer_ticket')
                .setLabel('Передать тикет')
                .setEmoji('🔄')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('close_ticket_lock')
                .setLabel('Закрыть тикет')
                .setEmoji('🔒')
                .setStyle(ButtonStyle.Danger)
        );

        const buttons2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('close_with_reason')
                .setLabel('Закрыть с причиной')
                .setEmoji('📝')
                .setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({ content: `${interaction.user} <@&${CONFIG.STAFF_ROLE_ID}>`, embeds: [welcomeEmbed] });
        await ticketChannel.send({ embeds: [controlEmbed], components: [buttons1, buttons2] });
        
        const logChannel = interaction.guild.channels.cache.get(CONFIG.LOG_CHANNEL_ID);
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('📩 Новый тикет создан')
                .setDescription(
                    `**Пользователь:** ${interaction.user} (\`${interaction.user.tag}\`)\n` +
                    `**ID:** \`${interaction.user.id}\`\n` +
                    `**Категория:** ${categoryEmoji} ${categoryLabel}\n` +
                    `**Номер тикета:** \`#${ticketNumber}\`\n` +
                    `**Канал:** ${ticketChannel}\n` +
                    `**Время:** <t:${Math.floor(Date.now() / 1000)}:F>`
                )
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: 'Система логирования тикетов', iconURL: interaction.guild.iconURL() })
                .setTimestamp();
            
            await logChannel.send({ embeds: [logEmbed] }).catch(err => console.error('Ошибка отправки лога:', err));
        }
        
        await interaction.editReply({ content: `✅ Тикет успешно создан: ${ticketChannel}` });
    }
}
// ==================== ПРОВЕРКА НОВЫХ ВИДЕО ====================
async function startYouTubeChecker() {
setInterval(async () => {
const newVideo = await checkNewVideo();
    if (newVideo) {
        const guild = client.guilds.cache.first();
        if (!guild) return;
        
        const channel = guild.channels.cache.get(CONFIG.YOUTUBE_NOTIFICATION_CHANNEL_ID);
        if (!channel) return;
        
        const videoEmbed = new EmbedBuilder()
            .setColor(COLORS.YOUTUBE)
            .setTitle('🎬 НОВОЕ ВИДЕО НА КАНАЛЕ!')
            .setURL(newVideo.url)
            .setDescription(
                `## ${newVideo.title}\n\n` +
                `${newVideo.description.substring(0, 200)}${newVideo.description.length > 200 ? '...' : ''}\n\n` +
                `📅 Опубликовано: <t:${Math.floor(new Date(newVideo.publishedAt).getTime() / 1000)}:R>\n\n` +
                `**👉 [СМОТРЕТЬ ВИДЕО](${newVideo.url})**\n\n` +
                `Не забудь поставить лайк и оставить комментарий! 🎮`
            )
            .setImage(newVideo.thumbnail)
            .setFooter({ text: 'ИГРАЕМ ВМЕСТЕ', iconURL: guild.iconURL() })
            .setTimestamp();
        
        await channel.send({ content: '@everyone', embeds: [videoEmbed] });
        console.log(`✅ Опубликовано уведомление о новом видео: ${newVideo.title}`);
    }
}, 5 * 60 * 1000);
}
// ==================== ФУНКЦИЯ ОБНОВЛЕНИЯ СТАТУС-КАНАЛОВ ====================
async function updateStatusChannels() {
try {
for (const guild of client.guilds.cache.values()) {
const statusCategory = guild.channels.cache.find(
c => c.type === ChannelType.GuildCategory && c.name === '📊 Статус'
);
        if (!statusCategory) continue;

        const totalMembers = guild.memberCount;
        const voiceMembers = guild.members.cache.filter(m => m.voice.channel).size;
        const boosts = guild.premiumSubscriptionCount || 0;

        const channelEmojis = {
            '👥': `👥 Всего участников: ${totalMembers}`,
            '🟢': `🟢 В голосе: ${voiceMembers}`,
            '⭐': `⭐ Бусты: ${boosts}`
        };

        for (const [emoji, channelName] of Object.entries(channelEmojis)) {
            const channel = guild.channels.cache.find(
                c => c.type === ChannelType.GuildVoice && 
                c.parentId === statusCategory.id && 
                c.name.startsWith(emoji)
            );

            if (channel) {
                await channel.setName(channelName).catch(() => {});
            }
        }
    }
} catch (error) {
    console.error('❌ Ошибка обновления статус-каналов:', error);
}
}
// ==================== ЗАПУСК БОТА ====================
client.on('ready', () => {
console.log(`🚀 Бот ${client.user.tag} готов к работе!`);
console.log(`📊 Серверов: ${client.guilds.cache.size}`);
console.log(`👥 Пользователей: ${client.users.cache.size}`);
client.user.setPresence({
    activities: [{
        name: '🎮 ИГРАЕМ ВМЕСТЕ | /help',
        type: ActivityType.Watching
    }],
    status: 'online'
});

console.log(`✅ Статус установлен: Смотрит 🎮 ИГРАЕМ ВМЕСТЕ | /help`);

startYouTubeChecker();
console.log('📺 Система проверки YouTube запущена');

updateStatusChannels();
setInterval(updateStatusChannels, 5 * 60 * 1000);
console.log('📊 Система обновления статус-каналов запущена');
});
if (!CONFIG.TOKEN) {
console.error("❌ ОШИБКА: Токен бота не найден! Проверь переменные окружения (Environment Variables).");
} else {
client.login(CONFIG.TOKEN).catch(err => {
console.error("❌ ОШИБКА ПРИ ВХОДЕ:", err.message);
});
}
