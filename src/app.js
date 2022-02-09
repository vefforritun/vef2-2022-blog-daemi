import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import { body, validationResult } from 'express-validator';
import passport from 'passport';
import { Strategy } from 'passport-local';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import xss from 'xss';
import { createComment } from './lib/db.js';
import { comparePasswords, findById, findByUsername } from './lib/users.js';
import { router as adminRouter } from './routes/admin-routes.js';

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: true }));

const {
  HOST: hostname = '127.0.0.1',
  PORT: port = 3000,
  DATABASE_URL: databaseUrl,
  SESSION_SECRET: sessionSecret = 'alæskdjfæalskdjfælaksjdf',
} = process.env;

if (!sessionSecret || !databaseUrl) {
  console.error('Vantar .env gildi');
  process.exit(1);
}

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
  })
);

const nationalIdPattern = '^[0-9]{6}-?[0-9]{4}$';

const path = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(path, '../public')));

app.set('views', join(path, '../views'));
app.set('view engine', 'ejs');

async function strat(username, password, done) {
  try {
    const user = await findByUsername(username);

    if (!user) {
      return done(null, false);
    }

    // Verður annað hvort notanda hlutur ef lykilorð rétt, eða false
    const result = await comparePasswords(password, user.password);

    return done(null, result ? user : false);
  } catch (err) {
    console.error(err);
    return done(err);
  }
}

passport.use(
  new Strategy(
    {
      usernameField: 'username',
      passwordField: 'password',
    },
    strat
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await findById(id);
    return done(null, user);
  } catch (error) {
    return done(error);
  }
});

app.use(passport.initialize());
app.use(passport.session());

app.use('/admin', adminRouter);

app.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  let message = '';

  // Athugum hvort einhver skilaboð séu til í session, ef svo er
  //  birtum þau og hreinsum skilaboð
  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }

  return res.send(`
    <form method="post" action="/login">
      <label>Notendanafn: <input type="text" name="username"></label>
      <label>Lykilorð: <input type="password" name="password"></label>
      <button>Innskrá</button>
    </form>
    <p>${message}</p>
  `);
});

app.post(
  '/login',
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/login',
  }),
  (req, res) => {
    res.redirect('/admin');
  }
);

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

/**
 * Hjálparfall til að athuga hvort reitur sé gildur eða ekki.
 *
 * @param {string} field Heiti á reit í formi
 * @param {array} errors Fylki af villum frá express-validator pakkanum
 * @returns {boolean} `true` ef `field` er í `errors`, `false` annars
 */
function isInvalid(field, errors = []) {
  // Boolean skilar `true` ef gildi er truthy (eitthvað fannst)
  // eða `false` ef gildi er falsy (ekkert fannst: null)
  return Boolean(errors.find((i) => i && i.param === field));
}

app.locals.isInvalid = isInvalid;

app.get('/', async (req, res) => {
  res.render('form', {
    title: 'Formið mitt',
    errors: [],
    data: {},
  });
});

const validation = [
  body('name')
    .isLength({ min: 1, max: 64 })
    .withMessage('Nafn má ekki vera tómt'),
  body('email').isLength({ min: 1 }).withMessage('Netfang má ekki vera tómt'),
  body('email').isEmail().withMessage('Netfang verður að vera gilt netfang'),
  body('nationalId')
    .isLength({ min: 1 })
    .withMessage('Kennitala má ekki vera tóm'),
  body('nationalId')
    .matches(new RegExp(nationalIdPattern))
    .withMessage('Kennitala verður að vera á formi 000000-0000 eða 0000000000'),
];

const sanitazion = [
  body('name').trim().escape(),
  body('email').normalizeEmail(),
  body('name').customSanitizer((value) => xss(value)),
  body('email').customSanitizer((value) => xss(value)),
  body('nationalId').customSanitizer((value) => xss(value)),
  body('comment').customSanitizer((value) => xss(value)),
];

const validationResults = (req, res, next) => {
  const { name = '', email = '', nationalId = '', comment = '' } = req.body;

  const result = validationResult(req);

  if (!result.isEmpty()) {
    // const errorMessages = errors.array().map((i) => i.msg);
    return res.render('form', {
      title: 'Formið mitt',
      errors: result.errors,
      data: { name, email, nationalId, comment },
    });
  }

  return next();
};

export const postComment = async (req, res) => {
  const { name, email, nationalId, comment } = req.body;

  const created = await createComment({ name, email, nationalId, comment });

  if (created) {
    return res.send('<p>Athugasemd móttekin!</p>');
  }

  return res.render('form', {
    title: 'Formið mitt',
    errors: [{ param: '', msg: 'Gat ekki búið til athugasemd' }],
    data: { name, email, nationalId, comment },
  });
};

app.post('/post', validation, validationResults, sanitazion, postComment);

app.listen(port, () => {
  console.info(`Server running at http://${hostname}:${port}/`);
});
