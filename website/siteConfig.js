const users = [
  {
    caption: 'User1',
    image: '/img/undraw_open_source.svg',
    infoLink: 'https://www.facebook.com',
    pinned: true,
  },
];

const siteConfig = {
  title: '',
  tagline: 'Welcome to IOV docs!',

  url: "http://docs.iov.one",
  baseUrl: "/",

  cname: 'docs.iov.one',
  projectName: 'docs',
  organizationName: 'iov-one',

  algolia: {
    apiKey: 'f305686cd1b020159501fba70bbc662a',
    indexName: 'iov-docs',
  },

  headerLinks: [
    {doc: 'intro', label: 'Docs'},
  //  {doc: 'doc4', label: 'API'},
    {page: 'help', label: 'Help'},
    { search: true },
  ],

  users,

  headerIcon: 'img/logo.png',
  footerIcon: false,
  favicon: 'img/favicon.ico',

  colors: {
    primaryColor: '#5AB3A5',
    secondaryColor: '#62C2B3',
  },
  /*
  fonts: {
    myFont: [
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },
  */

  copyright: `Copyright © ${new Date().getFullYear()} IOV`,

  highlight: {
    theme: 'default',
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

  // Show documentation's last update time.
  enableUpdateTime: true,
};

module.exports = siteConfig;
