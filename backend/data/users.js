const users = {
    0: {
        id: 0,
        username: "RolyPoly",
        email: "test@gmail.com",
        password: "battleships",
        jwt: "aaaa",
        profile: {
            username: "RolyPoly",
            displayName: "Free Roly Poly",
            tweets: 33094,
            bio: "a chrono trigger fan",
            location: "vancouver",
            website: "www.postmassiv.com",
            birthday: new Date(1990, 3, 23).toString().slice(4, 11),
            joinDate: new Date(2008, 7, 29).toString().slice(4, 11),
            following: 783,
            followers: 2008,
        },
        role: "admin",
    },
    1: {
        id: 1,
        username: "Crono",
        email: "crono@heroism.com",
        password: "iLoveMarle",
        jwt: "bbbb",
        profile: {
            username: "Crono",
            displayName: "punk haired kid",
            tweets: 930,
            bio: "a hero of legend",
            location: "la guardia",
            website: "www.chronotrigger.com",
            birthday: new Date(1996, 7, 27).toString().slice(4, 11),
            joinDate: new Date(2013, 4, 19).toString().slice(4, 11),
            following: 930,
            followers: 203999,
        },
        role: "moderator",
    },
    2: {
        id: 2,
        username: "Lucca",
        email: "genius@truceinventions.com",
        password: "taban1s7he8est",
        jwt: "cccc",
        profile: {
            username: "Lucca",
            displayName: "geniusInventorg1r1uwu",
            tweets: 7073,
            bio:
                "lorem ipsum doloret si here is some text. I am reading text. George Bush was POTUS for eight years. I support tea.",
            location: "also La Guardia",
            website: "www.notarealwebsitebylucca.com",
            birthday: new Date(1997, 12, 22).toString().slice(4, 11),
            joinDate: new Date(2006, 11, 9).toString().slice(4, 11),
            following: 26,
            followers: 80399,
        },
        role: "user",
    },
    3: {
        id: 3,
        username: "Marle",
        email: "tomboy@guardia.gov",
        password: "5heHeals3verything",
        jwt: "dddd",
        profile: {
            username: "Marle",
            displayName: "don't call me princess",
            tweets: 230,
            bio:
                "mostly just looking for another adventure. Wife of Crono. Mother of 3 kids and future queen of Guardia",
            location: "la guardia",
            website: "www.marleprojects.guardia.gov",
            birthday: new Date(1991, 2, 24).toString().slice(4, 11),
            joinDate: new Date(2018, 7, 27).toString().slice(4, 11),
            following: 1563,
            followers: 23777909,
        },
        role: "user",
    },
};

module.exports = {
    users: users,
};