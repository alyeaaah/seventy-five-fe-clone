import _ from "lodash";
import dayjs from "dayjs";
import { IconCashOnDelivery, IconQris, IconTransfer } from "@/assets/images/icons";

export const sfColor = {
  primary: "#065F46",
  secondary: "#EBCE56",
};

export const mapCenter = {
  lat: -7.275751,
  lng: 112.744225,
}
export const totalGroup = [2, 4, 8, 12, 16, 24, 32, 48, 64];

export enum TagsType {
  BLOG = "blog",
  MATCH = "match",
  PRODUCT = "product",
  GALLERY = "gallery",
}
export const tagsTypeValue = [
  { label: "All", value: "" },
  { label: "Blog", value: TagsType.BLOG },
  { label: "Match", value: TagsType.MATCH },
  { label: "Product", value: TagsType.PRODUCT },
  { label: "Gallery", value: TagsType.GALLERY },
];
export enum SponsorType {
  BLOG = "blog",
  MATCH = "match",
  TOURNAMENT = "tournament",
  GLOBAL = "global",
}
export const sponsorTypeValue = [
  { label: "Choose Type", value: "" },
  { label: "Blog", value: SponsorType.BLOG },
  { label: "Match", value: SponsorType.MATCH },
  { label: "Tournament", value: SponsorType.TOURNAMENT },
  { label: "Global", value: SponsorType.GLOBAL },
];

export enum CourtTypeValue {
  GRASS = "Grass",
  HARDCOURT = "Hard Court",
  CLAY = "Clay",
  FLEXIPAVE = "Flexi Pave",
}
export const courtTypeValue = [
  { label: "Choose Type", value: "" },
  { label: "Grass", value: CourtTypeValue.GRASS },
  { label: "Hard Court", value: CourtTypeValue.HARDCOURT },
  { label: "Clay", value: CourtTypeValue.CLAY },
  { label: "Flexi Pave", value: CourtTypeValue.FLEXIPAVE },
];

export enum ForehandStyleValue {
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}
export const forehandStyleValue = [
  { label: "Choose Type", value: "" },
  { label: "Left", value: ForehandStyleValue.LEFT },
  { label: "Right", value: ForehandStyleValue.RIGHT },
];

export enum BackhandStyleValue {
  ONEHANDED = "One Handed",
  DOUBLEHANDED = "Double Handed",
}
export const backhandStyleValue = [
  { label: "Choose Type", value: "" },
  { label: "One Handed", value: BackhandStyleValue.ONEHANDED },
  { label: "Double Handed", value: BackhandStyleValue.DOUBLEHANDED },
];

export enum GenderTypeValue {
  MALE = "m",
  FEMALE = "f",
}
export const genderTypeValue = [
  { label: "Choose Type", value: "" },
  { label: "Male", value: GenderTypeValue.MALE },
  { label: "Female", value: GenderTypeValue.FEMALE },
];

export enum PaymentMethodEnum {
  COD = "COD",
  BANK_TRANSFER = "TRANSFER",
  QRIS = "QRIS",
}
export const paymentMethodValue = [
  { label: "Cash On Delivery", value: PaymentMethodEnum.COD, icon: IconCashOnDelivery },
  { label: "Bank Transfer", value: PaymentMethodEnum.BANK_TRANSFER, icon: IconTransfer },
  { label: "QRIS Transfer", value: PaymentMethodEnum.QRIS, icon: IconQris },
];

export const bankNumber = [
  {
    name: "Hamzah Qhoswatul",
    number: "123456789",
    bank_code: "bca",
  }
]
export const gameScoreValue = ["0", "15", "30", "40", 'AD', 'WIN']

export enum ProductSizeEnum {
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
  XXL = "XXL",
  CUSTOM = "Custom",
  ALL = "All",
}
export const productSizeValue = [
  { label: "All Size", value: ProductSizeEnum.ALL },
  { label: "S", value: ProductSizeEnum.S },
  { label: "M", value: ProductSizeEnum.M },
  { label: "L", value: ProductSizeEnum.L },
  { label: "XL", value: ProductSizeEnum.XL },
  { label: "XXL", value: ProductSizeEnum.XXL },
  { label: "Custom", value: ProductSizeEnum.CUSTOM },
];

export enum ProductUnitEnum {
  PCS = "pcs",
  TUBE = "tube",
  PAIR = "pair",
  SET = "set"
}
export const productUnitValue = [
  { label: "Pcs", value: ProductUnitEnum.PCS },
  { label: "Tube", value: ProductUnitEnum.TUBE },
  { label: "Pair", value: ProductUnitEnum.PAIR },
  { label: "Set", value: ProductUnitEnum.SET },
];
export enum OrderStatus {
  ORDERED = "ORDERED",
  PAID = "PAID",
  PROCESSED = "PROCESSED",
  DELIVERED = "DELIVERED",
  RECEIVED = "RECEIVED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export const defaultAvatar = {
  m:"https://res.cloudinary.com/doqyrkqgw/image/upload/v1746818992/ava-m_x12gm1.png",
  f: "https://res.cloudinary.com/doqyrkqgw/image/upload/v1746819004/ava-f_zpingf.png"
};
export const staticImages = {
  playerOverview: "https://res.cloudinary.com/doqyrkqgw/image/upload/v1749768018/player-overview_iq7u3w.png",
  paperPattern: "https://res.cloudinary.com/doqyrkqgw/image/upload/v1749768017/paper-pattern_s7bu4h.png",
  myPlayer: "https://res.cloudinary.com/doqyrkqgw/image/upload/v1756154026/my-profile_q4rded.png",
  
}
export const dummyProductImage = [
  "https://humblezing.com/cdn/shop/files/HBZ-91.jpg?v=1720504689&width=384",
  "https://humblezing.com/cdn/shop/files/HUMBLEZING-5-2.jpg?v=1705311271&width=384",
  "https://humblezing.com/cdn/shop/files/HBZREVISI-4.jpg?v=1702018045&width=384",
  "https://humblezing.com/cdn/shop/files/HBZ-9_e3172b91-43a8-466d-92aa-952cef918f98.jpg?v=1741253086&width=384",
  "https://humblezing.com/cdn/shop/products/BEAMSCOACHPETROL.jpg?v=1644308014&width=384",
  "https://humblezing.com/cdn/shop/files/HBZ_-_174.jpg?v=1721192636&width=384"
]

export const defaultBio = [
  "I am a dedicated tennis player whose natural athleticism and sharp focus have made a significant impact in the competitive scene. Known for a strong work ethic and a keen understanding of strategy, I continue to sharpen my skills and elevate my performance with every match. Consistently pushing the boundaries of personal growth, I embrace challenges on the court and am driven by a passion for reaching new heights in the sport.",
   "I've always been drawn to the intensity and strategy of tennis. It’s a sport that demands both physical endurance and mental sharpness, and I’ve enjoyed honing my skills through consistent practice and dedication. My game has evolved over time, and I continue to challenge myself to reach new heights, always aiming to improve my serve, footwork, and overall match play. Outside of tennis, I value the discipline and focus the sport has instilled in me, which I apply to other areas of my life.",
  "Tennis has been a huge part of my life, and it's taught me a lot about perseverance and self-improvement. I’ve worked hard to refine my technique, focusing on areas like my backhand and court positioning. While I still have goals to achieve, I’m proud of the progress I’ve made so far. The competitive nature of tennis pushes me to constantly grow, both as a player and as an individual. Off the court, I love to stay active and enjoy other sports, but tennis will always be my main focus.",
  "I’ve always felt a connection to tennis, and it's a sport I continue to embrace for both the challenge and the thrill it offers. Over the years, I've developed a well-rounded game that reflects my commitment to hard work and continuous improvement. Whether it’s through refining my volleys or learning to read my opponent’s game, I’m always looking for ways to enhance my performance. Tennis has not only kept me physically fit but has also taught me valuable lessons in focus, resilience, and sportsmanship.",
  "My journey in tennis has been all about growth and passion. I’ve worked diligently to perfect my technique, focusing on everything from my footwork to my serve. Tennis has become more than just a sport for me; it's a way to push myself, test my limits, and learn from every match. What keeps me coming back to the court is the constant opportunity for improvement and the sheer enjoyment of playing. Off the court, I’m always striving for balance, and tennis has helped me cultivate that mindset in many aspects of my life."
]
interface Users {
  name: string;
  gender: string;
  email: string;
}

interface Products {
  name: string;
  category: string;
}

interface Categories {
  name: string;
  tags: string;
  slug: string;
}


interface News {
  title: string;
  superShortContent: string;
  shortContent: string;
  content: string;
}

interface Files {
  fileName: string;
  type: string;
  size: string;
}

interface Foods {
  name: string;
  image: string;
}

// const imageAssets = import.meta.glob<{
//   default: string;
// }>("/src/assets/images/fakers/*.{jpg,jpeg,png,svg}", { eager: true });

const fakers = {
  fakeUsers() {
    const users: Array<Omit<Users, "email">> = [
      { name: "Johnny Depp", gender: "male" },
      { name: "Al Pacino", gender: "male" },
      { name: "Robert De Niro", gender: "male" },
      { name: "Kevin Spacey", gender: "male" },
      { name: "Denzel Washington", gender: "male" },
      { name: "Russell Crowe", gender: "male" },
      { name: "Brad Pitt", gender: "male" },
      { name: "Angelina Jolie", gender: "female" },
      { name: "Leonardo DiCaprio", gender: "male" },
      { name: "Tom Cruise", gender: "male" },
      { name: "John Travolta", gender: "male" },
      { name: "Arnold Schwarzenegger", gender: "male" },
      { name: "Sylvester Stallone", gender: "male" },
      { name: "Kate Winslet", gender: "female" },
      { name: "Christian Bale", gender: "male" },
      { name: "Morgan Freeman", gender: "male" },
      { name: "Keanu Reeves", gender: "male" },
      { name: "Nicolas Cage", gender: "male" },
      { name: "Hugh Jackman", gender: "male" },
      { name: "Edward Norton", gender: "male" },
      { name: "Bruce Willis", gender: "male" },
      { name: "Tom Hanks", gender: "male" },
      { name: "Charlize Theron", gender: "female" },
      { name: "Will Smith", gender: "male" },
      { name: "Sean Connery", gender: "male" },
      { name: "Keira Knightley", gender: "female" },
      { name: "Vin Diesel", gender: "male" },
      { name: "Matt Damon", gender: "male" },
      { name: "Richard Gere", gender: "male" },
      { name: "Catherine Zeta-Jones", gender: "female" },
    ];

    return _.sampleSize(users, 3).map((user) => {
      return {
        name: user.name,
        gender: user.gender,
        email: _.toLower(_.replace(user.name, / /g, "") + "@left4code.com"),
      };
    });
  },
  fakePhotos() {
    return [""];
    const photos = [];
    // for (let i = 0; i < 15; i++) {
    //   photos[photos.length] =
    //     imageAssets[
    //       "/src/assets/images/fakers/profile-" + _.random(1, 15) + ".jpg"
    //     ].default;
    // }
    // return _.sampleSize(photos, 10);
  },
  fakeImages() {
    return [""];
    // const images = [];
    // for (let i = 0; i < 15; i++) {
    //   images[images.length] =
    //     imageAssets[
    //       "/src/assets/images/fakers/preview-" + _.random(1, 15) + ".jpg"
    //     ].default;
    // }
    // return _.sampleSize(images, 10);
  },
  fakeDates() {
    const dates = [];
    for (let i = 0; i < 5; i++) {
      dates[dates.length] = dayjs
        .unix(_.random(1586584776897, 1672333200000) / 1000)
        .format("DD MMMM YYYY");
    }
    return _.sampleSize(dates, 3);
  },
  fakeTimes() {
    const times = [
      "01:10 PM",
      "05:09 AM",
      "06:05 AM",
      "03:20 PM",
      "04:50 AM",
      "07:00 PM",
    ];
    return _.sampleSize(times, 3);
  },
  fakeFormattedTimes() {
    const times = [
      _.random(10, 60) + " seconds ago",
      _.random(10, 60) + " minutes ago",
      _.random(10, 24) + " hours ago",
      _.random(10, 20) + " days ago",
      _.random(10, 12) + " months ago",
    ];
    return _.sampleSize(times, 3);
  },
  fakeTotals() {
    return _.shuffle([_.random(20, 220), _.random(20, 120), _.random(20, 50)]);
  },
  fakeTrueFalse() {
    return _.sampleSize([false, true, true], 1);
  },
  fakeStocks() {
    return _.shuffle([_.random(50, 220), _.random(50, 120), _.random(50, 50)]);
  },
  fakeProducts() {
    const products = [
      { name: "Dell XPS 13", category: "PC & Laptop" },
      { name: "Apple MacBook Pro 13", category: "PC & Laptop" },
      { name: "Oppo Find X2 Pro", category: "Smartphone & Tablet" },
      { name: "Samsung Galaxy S20 Ultra", category: "Smartphone & Tablet" },
      { name: "Sony Master Series A9G", category: "Electronic" },
      { name: "Samsung Q90 QLED TV", category: "Electronic" },
      { name: "Nike Air Max 270", category: "Sport & Outdoor" },
      { name: "Nike Tanjun", category: "Sport & Outdoor" },
      { name: "Nikon Z6", category: "Photography" },
      { name: "Sony A7 III", category: "Photography" },
    ];
    return _.shuffle(products);
  },
  fakeCategories() {
    const categories = [
      { name: "PC & Laptop", tags: "Apple, Asus, Lenovo, Dell, Acer" },
      {
        name: "Smartphone & Tablet",
        tags: "Samsung, Apple, Huawei, Nokia, Sony",
      },
      { name: "Electronic", tags: "Sony, LG, Toshiba, Hisense, Vizio" },
      {
        name: "Home Appliance",
        tags: "Whirlpool, Amana, LG, Frigidaire, Samsung",
      },
      { name: "Photography", tags: "Canon, Nikon, Sony, Fujifilm, Panasonic" },
      { name: "Fashion & Make Up", tags: "Nike, Adidas, Zara, H&M, Levi’s" },
      {
        name: "Kids & Baby",
        tags: "Mothercare, Gini & Jony, H&M, Babyhug, Liliput",
      },
      { name: "Hobby", tags: "Bandai, Atomik R/C, Atlantis Models, Carisma" },
      {
        name: "Sport & Outdoor",
        tags: "Nike, Adidas, Puma, Rebook, Under Armour",
      },
    ];

    return _.sampleSize(categories, 3).map((category) => {
      return {
        name: category.name,
        tags: category.tags,
        slug: _.replace(
          _.replace(_.toLower(category.name), / /g, "-"),
          "&",
          "and"
        ),
      };
    });
  },
  fakeNews() {
    const news = [
      {
        title: "Desktop publishing software like Aldus PageMaker",
        superShortContent: _.truncate(
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
          {
            length: 30,
            omission: "",
          }
        ),
        shortContent: _.truncate(
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
          {
            length: 150,
            omission: "",
          }
        ),
        content:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      },
      {
        title: "Dummy text of the printing and typesetting industry",
        superShortContent: _.truncate(
          "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
          {
            length: 30,
            omission: "",
          }
        ),
        shortContent: _.truncate(
          "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
          {
            length: 150,
            omission: "",
          }
        ),
        content:
          "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
      },
      {
        title: "Popularised in the 1960s with the release of Letraset",
        superShortContent: _.truncate(
          'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32. The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.',
          {
            length: 30,
            omission: "",
          }
        ),
        shortContent: _.truncate(
          'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32. The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.',
          {
            length: 150,
            omission: "",
          }
        ),
        content:
          'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32. The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.',
      },
      {
        title: "200 Latin words, combined with a handful of model sentences",
        superShortContent: _.truncate(
          "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.",
          {
            length: 50,
            omission: "",
          }
        ),
        shortContent: _.truncate(
          "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.",
          {
            length: 150,
            omission: "",
          }
        ),
        content:
          "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.",
      },
    ];
    return _.shuffle(news);
  },
  fakeFiles() {
    const files = [
      { fileName: "Celine Dion - Ashes.mp4", type: "MP4", size: "20 MB" },
      { fileName: "Laravel 7", type: "Empty Folder", size: "120 MB" },
      { fileName: fakers.fakeImages()[0], type: "Image", size: "1.2 MB" },
      { fileName: "Repository", type: "Folder", size: "20 KB" },
      { fileName: "Resources.txt", type: "TXT", size: "2.2 MB" },
      { fileName: "Routes.php", type: "PHP", size: "1 KB" },
      { fileName: "Dota 2", type: "Folder", size: "112 GB" },
      { fileName: "Documentation", type: "Empty Folder", size: "4 MB" },
      { fileName: fakers.fakeImages()[0], type: "Image", size: "1.4 MB" },
      { fileName: fakers.fakeImages()[0], type: "Image", size: "1 MB" },
    ];
    return _.shuffle(files);
  },
  fakeJobs() {
    const jobs = [
      "Frontend Engineer",
      "Software Engineer",
      "Backend Engineer",
      "DevOps Engineer",
    ];
    return _.shuffle(jobs);
  },
  fakeNotificationCount() {
    return _.random(1, 7);
  },
  fakeFoods() {
    return [{
        name: "",
        image:"",
      }];
    // const foods = [
    //   {
    //     name: "Vanilla Latte",
    //     image:
    //       imageAssets["/src/assets/images/fakers/food-beverage-1.jpg"].default,
    //   },
    //   {
    //     name: "Milkshake",
    //     image:
    //       imageAssets["/src/assets/images/fakers/food-beverage-2.jpg"].default,
    //   },
    //   {
    //     name: "Soft Drink",
    //     image:
    //       imageAssets["/src/assets/images/fakers/food-beverage-3.jpg"].default,
    //   },
    //   {
    //     name: "Root Beer",
    //     image:
    //       imageAssets["/src/assets/images/fakers/food-beverage-4.jpg"].default,
    //   },
    //   {
    //     name: "Pocari",
    //     image:
    //       imageAssets["/src/assets/images/fakers/food-beverage-5.jpg"].default,
    //   },
    //   {
    //     name: "Ultimate Burger",
    //     image:
    //       imageAssets["/src/assets/images/fakers/food-beverage-6.jpg"].default,
    //   },
    //   {
    //     name: "Hotdog",
    //     image:
    //       imageAssets["/src/assets/images/fakers/food-beverage-7.jpg"].default,
    //   },
    //   {
    //     name: "Avocado Burger",
    //     image:
    //       imageAssets["/src/assets/images/fakers/food-beverage-8.jpg"].default,
    //   },
    //   {
    //     name: "Spaghetti Fettucine Aglio with Beef Bacon",
    //     image:
    //       imageAssets["/src/assets/images/fakers/food-beverage-9.jpg"].default,
    //   },
    //   {
    //     name: "Spaghetti Fettucine Aglio with Smoked Salmon",
    //     image:
    //       imageAssets["/src/assets/images/fakers/food-beverage-10.jpg"].default,
    //   },
    //   {
    //     name: "Curry Penne and Cheese",
    //     image:
    //       imageAssets["/src/assets/images/fakers/food-beverage-11.jpg"].default,
    //   },
    //   {
    //     name: "French Fries",
    //     image:
    //       imageAssets["/src/assets/images/fakers/food-beverage-12.jpg"].default,
    //   },
    //   {
    //     name: "Virginia Cheese Fries",
    //     image:
    //       imageAssets["/src/assets/images/fakers/food-beverage-13.jpg"].default,
    //   },
    //   {
    //     name: "Virginia Cheese Wedges",
    //     image:
    //       imageAssets["/src/assets/images/fakers/food-beverage-14.jpg"].default,
    //   },
    //   {
    //     name: "Fried/Grilled Banana",
    //     image:
    //       imageAssets["/src/assets/images/fakers/food-beverage-15.jpg"].default,
    //   },
    //   {
    //     name: "Crispy Mushroom",
    //     image:
    //       imageAssets["/src/assets/images/fakers/food-beverage-16.jpg"].default,
    //   },
    //   {
    //     name: "Fried Calamari",
    //     image:
    //       imageAssets["/src/assets/images/fakers/food-beverage-17.jpg"].default,
    //   },
    //   {
    //     name: "Chicken Wings",
    //     image:
    //       imageAssets["/src/assets/images/fakers/food-beverage-18.jpg"].default,
    //   },
    //   {
    //     name: "Snack Platter",
    //     image:
    //       imageAssets["/src/assets/images/fakers/food-beverage-19.jpg"].default,
    //   },
    // ];
    // return _.shuffle(foods);
  },
};

const fakerData: Array<{
  users: Users[];
  photos: string[];
  images: string[];
  dates: string[];
  times: string[];
  formattedTimes: string[];
  totals: number[];
  trueFalse: boolean[];
  stocks: number[];
  products: Products[];
  categories: Categories[];
  news: News[];
  files: Files[];
  jobs: string[];
  notificationCount: number;
  foods: Foods[];
}> = [];
for (let i = 0; i < 20; i++) {
  fakerData[fakerData.length] = {
    users: fakers.fakeUsers(),
    photos: fakers.fakePhotos(),
    images: fakers.fakeImages(),
    dates: fakers.fakeDates(),
    times: fakers.fakeTimes(),
    formattedTimes: fakers.fakeFormattedTimes(),
    totals: fakers.fakeTotals(),
    trueFalse: fakers.fakeTrueFalse(),
    stocks: fakers.fakeStocks(),
    products: fakers.fakeProducts(),
    categories: fakers.fakeCategories(),
    news: fakers.fakeNews(),
    files: fakers.fakeFiles(),
    jobs: fakers.fakeJobs(),
    notificationCount: fakers.fakeNotificationCount(),
    foods: fakers.fakeFoods(),
  };
}

export default fakerData;
