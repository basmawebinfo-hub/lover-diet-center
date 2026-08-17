/**
 * Dr. Wael Mousa's television episodes, as aired on Sharjah TV and published
 * on the practice's YouTube channel.
 *
 * `title` is a cleaned-up display label. The YouTube titles carry typos and
 * trailing air dates baked into the string ("2 9 2014امراض القلب",
 * "استشارى التغية وائل موسى"), which read badly in a credentials section.
 * The videos themselves are untouched — only what we print is normalised, and
 * the air date is split out into its own field so it can be shown properly.
 *
 * `id` is the YouTube video id. Keep these in air order, newest first.
 */
export type TvEpisode = {
  id: string
  titleAr: string
  titleEn: string
  /** Air date as printed on the episode, when the source title carried one. */
  date?: string
}

export const TV_EPISODES: TvEpisode[] = [
  {
    id: 'kqfWYzOpq34',
    titleAr: 'حمية الفواكه: ما لها وما عليها',
    titleEn: 'The Fruit Diet: Pros and Cons',
    date: '2019-02-06',
  },
  {
    id: '6A-fGu41oMY',
    titleAr: 'التغذية والذاكرة',
    titleEn: 'Nutrition and Memory',
  },
  {
    id: 'l7HqSC9GRgY',
    titleAr: 'السمنة والأطفال',
    titleEn: 'Obesity and Children',
  },
  {
    id: 'JS0wUzXjQ2c',
    titleAr: 'النشويات ودورها في حياة الإنسان',
    titleEn: 'Carbohydrates and Their Role in Daily Life',
  },
  {
    id: '_e0mbYxkrIo',
    titleAr: 'النشويات وأهميتها في حياتنا — الجزء الثاني',
    titleEn: 'Carbohydrates and Why They Matter — Part 2',
  },
  {
    id: 'poiiDBL1_LY',
    titleAr: 'النشويات مع استشاري التغذية وائل موسى',
    titleEn: 'Carbohydrates with Nutrition Consultant Wael Mousa',
  },
  {
    id: 'RjHbXyGZ6ys',
    titleAr: 'عاداتنا الغذائية في رمضان',
    titleEn: 'Our Eating Habits in Ramadan',
  },
  {
    id: '5JeSbZDg8_k',
    titleAr: 'الشراهة في الأكل',
    titleEn: 'Binge Eating',
    date: '2014-10-21',
  },
  {
    id: 'Ti_IFfrlrQs',
    titleAr: 'المشروبات الصحية',
    titleEn: 'Healthy Drinks',
    date: '2014-09-30',
  },
  {
    id: '-7lIFT7T1-8',
    titleAr: 'أمراض القلب',
    titleEn: 'Heart Disease',
    date: '2014-09-02',
  },
  {
    id: '-cFpEOUQpW8',
    titleAr: 'رمضان والأكل',
    titleEn: 'Ramadan and Food',
    date: '2014-08-05',
  },
  {
    id: 'YqU_EyXAwRg',
    titleAr: 'لقاء مع استشاري التغذية وائل موسى',
    titleEn: 'Interview with Nutrition Consultant Wael Mousa',
  },
  {
    id: 'PigHYHxXqTw',
    titleAr: 'استشاري التغذية وائل موسى — حلقة تلفزيونية',
    titleEn: 'Nutrition Consultant Wael Mousa — TV Episode',
  },
]

/** Watch page, for the "open on YouTube" fallback and the card link. */
export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`
}

/**
 * Privacy-preserving embed host. youtube-nocookie.com does not write tracking
 * cookies until the viewer actually plays something, which matters because
 * these load on a page that otherwise sets none.
 */
export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
}

/**
 * Thumbnail served straight from YouTube's image CDN.
 *
 * hqdefault exists for every video; maxresdefault 404s on older uploads, and
 * several of these episodes are from 2014.
 */
export function youtubeThumbUrl(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}
