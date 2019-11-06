const users = [
  {
    caption: 'User1',
    image: '/img/undraw_open_source.svg',
    infoLink: 'https://www.facebook.com',
    pinned: true,
  },
];

const siteConfig = {
  title: 'IOV Documentations',
  tagline: 'Welcome to IOV docs!',

  url: "https://docs.iov.one",
  baseUrl: "/",

  cname: 'docs.iov.one',
  projectName: 'docs',
  organizationName: 'iov-one',

  algolia: {
    apiKey: '8dc8128a9091306e7bbd0effdaa5241a',
    indexName: 'iov',
  },

  headerLinks: [
    { href: "https://github.com/iov-one", label: "GitHub" },
    { search: true },
  ],

  disableHeaderTitle: true,

  users,

  headerIcon: 'img/logo.png',
  footerIcon: false,
  favicon: 'img/favicon.ico',

  colors: {
    primaryColor: '#35c1b3',
    secondaryColor: 'grey',
  },
  

  fonts: {
    myFont: [
      "din",
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },

  copyright: `Copyright © ${new Date().getFullYear()} IOV`,

  highlight: {
    theme: 'atom-one-light',
  },

  scripts: ['https://buttons.github.io/buttons.js'],

  onPageNav: 'separate',

  docsSideNavCollapsible: true,

  cleanUrl: true,

  // Open Graph and Twitter card images.
  ogImage: 'img/undraw_online.svg',
  twitterImage: 'img/undraw_tweetstorm.svg',

  // Show documentation's last contributor's name.
  enableUpdateBy: true,
};

module.exports = siteConfig;
