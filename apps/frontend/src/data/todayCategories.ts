import catAdhaGreeting from '../assets/categories/cat_adha_greeting_1779964212732.png';
import catDigitalArt from '../assets/categories/cat_digital_art_1779964317279.png';
import catHealthyBreakfast from '../assets/categories/cat_healthy_breakfast_1779964268712.png';
import catMinimalistRoom from '../assets/categories/cat_minimalist_room_1779964244697.png';
import catMusicDiy from '../assets/categories/cat_music_diy_1779964229377.png';
import catNaturePhotography from '../assets/categories/cat_nature_photography_1779964337114.png';
import catStreetwear from '../assets/categories/cat_streetwear_1779964300816.png';

export interface TodayCategory {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  unsplashKeywords: string;
}

export const todayCategories: TodayCategory[] = [
  {
    id: "1",
    title: "Adha greeting",
    slug: "adha-greeting",
    coverImage: catAdhaGreeting,
    unsplashKeywords: "eid,greeting,islamic,lantern"
  },
  {
    id: "2",
    title: "Music inspired DIY",
    slug: "music-inspired-diy",
    coverImage: catMusicDiy,
    unsplashKeywords: "music,diy,craft,vinyl,guitar"
  },
  {
    id: "3",
    title: "Minimalist Room Decor",
    slug: "minimalist-room-decor",
    coverImage: catMinimalistRoom,
    unsplashKeywords: "minimalist,room,interior,decor,white"
  },
  {
    id: "4",
    title: "Healthy Breakfast Ideas",
    slug: "healthy-breakfast-ideas",
    coverImage: catHealthyBreakfast,
    unsplashKeywords: "healthy,breakfast,toast,smoothie,morning"
  },
  {
    id: "5",
    title: "Streetwear Fashion",
    slug: "streetwear-fashion",
    coverImage: catStreetwear,
    unsplashKeywords: "streetwear,fashion,urban,style,sneakers"
  },
  {
    id: "6",
    title: "Digital Art Portrait",
    slug: "digital-art-portrait",
    coverImage: catDigitalArt,
    unsplashKeywords: "digital,art,portrait,fantasy,neon"
  },
  {
    id: "7",
    title: "Nature Photography",
    slug: "nature-photography",
    coverImage: catNaturePhotography,
    unsplashKeywords: "nature,landscape,forest,mountain,travel"
  }
];
