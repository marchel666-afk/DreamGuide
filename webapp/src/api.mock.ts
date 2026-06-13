import type { Dream, Interpretation, Stats, GalleryDream, CalendarData } from './types';

const mockInterpretations: Interpretation[] = [
  {
    id: 1,
    dream_id: 1,
    type: 'psychological',
    content: 'Лес в вашем сне — классический юнгианский символ бессознательного. Тёмные деревья олицетворяют неизведанные части вашей психики, а потеря пути указывает на чувство неопределённости в реальной жизни. Возможно, вы переживаете период смены ценностей или жизненного курса. Подсознание приглашает вас исследовать свои внутренние страхи, вместо того чтобы избегать их.',
    is_premium: false,
    created_at: '2026-06-12T08:30:00',
  },
  {
    id: 2,
    dream_id: 1,
    type: 'everyday',
    content: 'Такой сон часто снится перед важным решением или на пороге перемен. Лес символизирует ситуацию, в которой вы не видите выхода целиком, но он есть. Обратите внимание на людей вокруг — возможно, кто-то готов помочь, но вы ещё не попросили. Хороший день, чтобы довериться интуиции.',
    is_premium: false,
    created_at: '2026-06-12T08:31:00',
  },
];

const mockDreams: Dream[] = [
  {
    id: 1,
    user_id: 123,
    text: 'Я шёл по тёмному лесу и не мог найти дорогу домой. Деревья становились всё выше, а небо — темнее. Вдруг я увидел свет вдали и побежал к нему, но он всё время отдалялся.',
    emotion: 'fear',
    created_at: '2026-06-12T07:15:00',
    is_public: false,
    interpretations: mockInterpretations,
  },
  {
    id: 2,
    user_id: 123,
    text: 'Летел над городом на рассвете. Здания были маленькими, как игрушечные. Чувствовал невероятную лёгкость и свободу — будто все проблемы остались внизу.',
    emotion: 'joy',
    created_at: '2026-06-11T06:45:00',
    is_public: true,
    interpretations: [
      {
        id: 3,
        dream_id: 2,
        type: 'creative',
        content: 'Этот сон — готовый образ для творческого проекта. Полёт над городом на рассвете несёт идею преодоления земного, бытового. Попробуйте написать короткое стихотворение от лица человека, который смотрит на свою жизнь с высоты птичьего полёта — что он видит, что отпускает, к чему летит?',
        is_premium: false,
        created_at: '2026-06-11T07:00:00',
      },
    ],
  },
  {
    id: 3,
    user_id: 123,
    text: 'Опоздал на важный экзамен. Бежал по коридорам незнакомого университета, все двери были заперты. Проснулся в холодном поту.',
    emotion: 'fear',
    created_at: '2026-06-10T05:30:00',
    is_public: false,
    interpretations: [],
  },
  {
    id: 4,
    user_id: 123,
    text: 'Встретил старого друга, которого не видел много лет. Мы сидели в кафе у моря, пили кофе и смеялись. Было ощущение, что ничего не изменилось.',
    emotion: 'joy',
    created_at: '2026-06-09T08:20:00',
    is_public: false,
    interpretations: [],
  },
  {
    id: 5,
    user_id: 123,
    text: 'Вода поднималась всё выше. Я стоял на крыше дома и смотрел как затапливает улицы. Было странное спокойствие — не страх, а что-то похожее на смирение.',
    emotion: 'sadness',
    created_at: '2026-06-08T06:10:00',
    is_public: true,
    interpretations: [],
  },
];

const mockStats: Stats = {
  total_dreams: 5,
  streak_days: 5,
  total_stars: 15,
  emotions: { fear: 2, joy: 2, sadness: 1 },
  recent_dreams: mockDreams.slice(0, 5),
};

const mockCalendar: CalendarData = {
  '2026-06-08': 1,
  '2026-06-09': 1,
  '2026-06-10': 1,
  '2026-06-11': 1,
  '2026-06-12': 1,
  '2026-06-02': 1,
  '2026-06-03': 2,
  '2026-06-05': 1,
};

const mockGallery: GalleryDream[] = [
  {
    id: 10,
    text: 'Летел над огромным городом будущего. Здания уходили в облака, а между ними — подвесные сады.',
    emotion: 'surprise',
    created_at: '2026-06-12T10:00:00',
    author_initials: 'АК',
    interpretation_preview: 'Город будущего символизирует ваши амбиции и стремление к развитию. Подвесные сады — знак того, что вы ищете баланс между карьерой и личной жизнью.',
  },
  {
    id: 11,
    text: 'Разговаривал с морем. Оно отвечало волнами — каждая была отдельным словом, но я не помнил языка.',
    emotion: 'sadness',
    created_at: '2026-06-11T22:30:00',
    author_initials: 'МР',
    interpretation_preview: 'Море как собеседник — архетип глубинного бессознательного. Забытый язык волн указывает на утраченную связь с интуицией.',
  },
  {
    id: 12,
    text: 'Нашёл старый дом детства, но внутри он был огромным дворцом. В каждой комнате — воспоминание из разного возраста.',
    emotion: 'surprise',
    created_at: '2026-06-11T09:15:00',
    author_initials: 'ВС',
    interpretation_preview: 'Дом-дворец — символ вашей богатой внутренней жизни. Комнаты с воспоминаниями говорят о том, что прошлое — ресурс, а не груз.',
  },
  {
    id: 13,
    text: 'Бежал по полю к горизонту. Горизонт не приближался, но бежать было легко и приятно.',
    emotion: 'joy',
    created_at: '2026-06-10T07:40:00',
    author_initials: 'НП',
    interpretation_preview: 'Бег без финиша — сон о процессе, а не результате. Ваше подсознание говорит: наслаждайтесь путём.',
  },
  {
    id: 14,
    text: 'Стоял перед зеркалом, но отражение двигалось само по себе. Не было страшно — только любопытно.',
    emotion: 'surprise',
    created_at: '2026-06-09T23:55:00',
    author_initials: 'ДЛ',
    interpretation_preview: 'Независимое отражение — встреча с теневой стороной личности по Юнгу. Отсутствие страха говорит о готовности к самопознанию.',
  },
];

function delay(ms = 400): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

let nextId = 6;
let dreamsStore = [...mockDreams];

export const mockApi = {
  dreams: {
    list: async (): Promise<Dream[]> => { await delay(); return [...dreamsStore].reverse(); },
    get: async (id: number): Promise<Dream> => {
      await delay();
      const d = dreamsStore.find((d) => d.id === id);
      if (!d) throw new Error('Not found');
      return d;
    },
    create: async (data: { text: string; emotion: string }): Promise<Dream> => {
      await delay(600);
      const dream: Dream = {
        id: nextId++,
        user_id: 123,
        text: data.text,
        emotion: data.emotion as any,
        created_at: new Date().toISOString(),
        is_public: false,
        interpretations: [],
      };
      dreamsStore.push(dream);
      return dream;
    },
    interpret: async (id: number, type: string): Promise<Interpretation> => {
      await delay(1200);
      const contents: Record<string, string> = {
        psychological: 'В вашем сне прослеживается архетип трансформации. Образы, которые вы описываете, указывают на внутренний конфликт между стремлением к безопасности и желанием перемен. С точки зрения юнгианской психологии, это приглашение исследовать теневые аспекты личности — те качества, которые вы привыкли отрицать или подавлять.',
        everyday: 'Такой сон часто предшествует важным переменам в реальной жизни. Обратите внимание на детали — они подсказывают, в какой сфере стоит ожидать новостей. Сегодня хороший день для принятия решений, которые вы откладывали.',
        creative: 'Образы этого сна — готовый материал для творчества. Попробуйте нарисовать ключевой момент сна или написать небольшой рассказ от первого лица. Ваше подсознание предлагает вам уникальный визуальный язык — воспользуйтесь им.',
      };
      const interp: Interpretation = {
        id: Math.random() * 1000 | 0,
        dream_id: id,
        type,
        content: contents[type] ?? contents.psychological,
        is_premium: false,
        created_at: new Date().toISOString(),
      };
      dreamsStore = dreamsStore.map((d) =>
        d.id === id ? { ...d, interpretations: [...(d.interpretations || []), interp] } : d
      );
      return interp;
    },
    togglePublic: async (id: number): Promise<Dream> => {
      await delay(300);
      dreamsStore = dreamsStore.map((d) =>
        d.id === id ? { ...d, is_public: !d.is_public } : d
      );
      return dreamsStore.find((d) => d.id === id)!;
    },
  },
  stats: {
    get: async (): Promise<Stats> => {
      await delay();
      return { ...mockStats, recent_dreams: [...dreamsStore].reverse().slice(0, 5) };
    },
    calendar: async (): Promise<CalendarData> => { await delay(); return mockCalendar; },
    emotions: async () => { await delay(); return mockStats.emotions; },
  },
  gallery: {
    list: async (): Promise<GalleryDream[]> => { await delay(); return mockGallery; },
  },
  payments: {
    prices: async () => ({ deep_interpret: 10, nightmare: 15, pdf_export: 25, secret_symbol: 5, no_ads_week: 12, premium_month: 49 }),
  },
};
