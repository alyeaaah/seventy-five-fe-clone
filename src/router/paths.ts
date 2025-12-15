import { route, stringParser } from "typesafe-routes";

export const paths = {
  landingPage: "/",
  administrator: {
    dashboard: "/admin",
    masterData: {
      categories: "/admin/master-data/categories",
      sponsors: "/admin/master-data/sponsors",
      courts: "/admin/master-data/courts",
      pointConfigForm: route(`/admin/master-data/point-configuration/form/:uuid`, {
        uuid: stringParser
      }, {}),
      pointConfig: "/admin/master-data/point-configuration/index",
      levels: "/admin/master-data/levels",
      leagues: "/admin/master-data/leagues",
      tags: "/admin/master-data/tags",
      referee: "/admin/master-data/referee",
      kudos: "/admin/master-data/kudos",
    },
    courts: {
      new: `/admin/courts/new`,
      edit: route(`/admin/courts/edit/:court`, {
        court: stringParser
      }, {}),
      index: "/admin/courts", 
    },
    players: {
      new: `/admin/players/new`,
      edit: route(`/admin/players/edit/:player`, {
        player: stringParser
      }, {}),
      index: "/admin/players", 
    },
    tournaments: {
      new: {
        brackets: route(`/admin/tournaments/new/brackets/:id`, {
          id: stringParser
        }, {}),
        points: route(`/admin/tournaments/new/points/:id`, {
          id: stringParser
        }, {}),
        players: route(`/admin/tournaments/new/players/:id`, {
          id: stringParser
        }, {}),
        done: route(`/admin/tournaments/new/done/:id`, {
          id: stringParser
        }, {}),
        index: "/admin/tournaments/new"
      },
      detail: route(`/admin/tournaments/detail/:id`, {
        id: stringParser
      }, {}),
      match: route(`/admin/tournaments/match/:matchUuid`, {
        matchUuid: stringParser
      }, {}),
      edit: route(`/admin/tournaments/edit/:tournament`, {
        tournament: stringParser
      }, {}),
      index: "/admin/tournaments", 
    },
    customMatch: {
      index: "/admin/custom-match",
      new: "/admin/custom-match/new",
      edit: route(`/admin/custom-match/edit/:customMatchUuid`, {
        customMatchUuid: stringParser
      }, {}),
      friendlyMatch: {
        new: "/admin/custom-match/friendly-match/new",
        edit: {
          points: route(`/admin/custom-match/friendly-match/edit/points/:friendlyMatchUuid`, {
            friendlyMatchUuid: stringParser
          }, {}),
          schedule: route(`/admin/custom-match/friendly-match/edit/schedule/:friendlyMatchUuid`, {
            friendlyMatchUuid: stringParser
          }, {}),
          players: route(`/admin/custom-match/friendly-match/edit/players/:friendlyMatchUuid`, {
            friendlyMatchUuid: stringParser
          }, {}),
          index:route(`/admin/custom-match/friendly-match/edit/:friendlyMatchUuid`, {
            friendlyMatchUuid: stringParser
          }, {}),
        },
        detail: route(`/admin/custom-match/friendly-match/:friendlyMatchUuid`, {
          friendlyMatchUuid: stringParser
        }, {}),
        index: "/admin/custom-match/friendly-match",
      },
      detail: route(`/admin/custom-match/detail/:matchUuid`, {
        matchUuid: stringParser
      }, {}),

    },
    galleries: {
      new: {
        index: "/admin/galleries/new"
      },
      detail: route(`/admin/galleries/detail/:id`, {
        id: stringParser
      }, {}),
      edit: route(`/admin/galleries/edit/:id`, {
        id: stringParser
      }, {}),
      index: "/admin/galleries", 
    },
    blog: {
      new: {
        index: "/admin/blog/new"
      },
      detail: route(`/admin/blog/detail/:id`, {
        id: stringParser
      }, {}),
      edit: route(`/admin/blog/edit/:id`, {
        id: stringParser
      }, {}),
      index: "/admin/blog", 
    },
    class: "/admin/class",
    merchandise: {
      new: "/admin/merchandise/new",
      detail: route(`/admin/merchandise/detail/:id`, {
        id: stringParser
      }, {}),
      edit: route(`/admin/merchandise/edit/:id`, {
        id: stringParser
      }, {}),
      index: "/admin/merchandise", 
    },
    orders: {
      detail: route(`/admin/orders/detail/:uuid`, {
        uuid: stringParser
      }, {}),
      index: route("/admin/orders/&:status?", {
        status: stringParser
      }, {}), 
    },
  },
  player: {
    home: "/player",

    matches: {
      detail: route(`/admin/tournaments/detail/:id`, {
        id: stringParser
      }, {}),
      match: route(`/admin/tournaments/match/:matchUuid`, {
        matchUuid: stringParser
      }, {}),
      index: "/player/tournaments", 
    },
    orders: {
      index: "/player/matches", 
      detail: route(`/player/orders/detail/:uuid`, {
        uuid: stringParser
      }, {}),
    },
    profile: {
      edit: "/player/profile/edit", 
      index: "/player/profile", 
    },
  },
  tournament: {
    index: route(`/tournament/&:uuid?`, {
       uuid: stringParser
    }, {}),
    match: route(`/tournament/match/:matchUuid`, {
      matchUuid: stringParser
    }, {}),
    standings: route(`/tournament/standings/&:league?`, {
       league: stringParser
    }, {}),
  },
  challenger: {
    index: route(`/challenger/&:uuid?`, {
      uuid: stringParser
    }, {}),
    match: route(`/challenger/match/:matchUuid`, {
      matchUuid: stringParser
    }, {}),
  },
  merchandise: {
    index: route(`/merchandise/&:uuid?`, {
      uuid: stringParser
    }, {}),
    product: route(`/merchandise/product/:productUuid`, {
      productUuid: stringParser
    }, {}),
  },
  players: {
    info: route(`/players/:uuid`, {
      uuid: stringParser
    }, {}),
    index: '/player',
  },
  galleries: {
    index: "/galleries",
    detail: route(`/galleries/detail/:id/&:image?`, {
      id: stringParser,
      image: stringParser
    }, {}),
    tags: route(`/galleries/tags/:tag`, {
      tag: stringParser
    }, {}),
  },
  news: {
    index: "/news",
    detail: route(`/news/detail/:uuid`, {
      uuid: stringParser
    }, {}),
    tags: route(`/news/tags/:tag`, {
      tag: stringParser
    }, {}),
  },
  shop: {
    index: "/shop",
    detail: route(`/shop/detail/:uuid`, {
      uuid: stringParser
    }, {}),
    tags: route(`/shop/tags/:tag`, {
      tag: stringParser
    }, {}),
    cart: "/shop/cart",
    checkout: "/shop/checkout",
  },
  register: "/register",
  error: "/error",
  login: "/login",
} as const;
