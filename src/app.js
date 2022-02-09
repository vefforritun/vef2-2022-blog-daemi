import dotenv from 'dotenv';
import express from 'express';
import { body, validationResult } from 'express-validator';
import { dirname, join } from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: true }));

const {
  HOST: hostname = '127.0.0.1',
  PORT: port = 3000,
  DATABASE_URL: connectionString,
  NODE_ENV: nodeEnv,
} = process.env;

// Notum SSL tengingu við gagnagrunn ef við erum *ekki* í development
// mode, á heroku, ekki á local vél
const ssl = nodeEnv !== 'development' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('postgres error, exiting...', err);
  process.exit(-1);
});

const nationalIdPattern = '^[0-9]{6}-?[0-9]{4}$';

const path = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(path, '../public')));

app.set('views', join(path, '../views'));
app.set('view engine', 'ejs');

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

async function query(q, values) {
  let client;

  try {
    client = await pool.connect();
  } catch (e) {
    console.error('Unable to connect', e);
    return null;
  }

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    console.error('Error running query', e);
    return null;
  } finally {
    client.release();
  }
}

async function createComment({ name, email, nationalId, comment }) {
  const q = `
    INSERT INTO
      comments(name, email, nationalId, comment)
    VALUES
      ($1, $2, $3, $4)
    RETURNING *`;
  const values = [name, email, nationalId, comment];

  const result = await query(q, values);

  return result !== null;
}

const validation = [
  body('name').isLength({ min: 1 }).withMessage('Nafn má ekki vera tómt'),
  body('email').isLength({ min: 1 }).withMessage('Netfang má ekki vera tómt'),
  body('email').isEmail().withMessage('Netfang verður að vera gilt netfang'),
  body('nationalId')
    .isLength({ min: 1 })
    .withMessage('Kennitala má ekki vera tóm'),
  body('nationalId')
    .matches(new RegExp(nationalIdPattern))
    .withMessage('Kennitala verður að vera á formi 000000-0000 eða 0000000000'),
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

const postComment = async (req, res) => {
  const { name, email, nationalId, comment } = req.body;
  console.log('req.body :>> ', req.body);

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

app.post('/post', validation, validationResults, postComment);

app.listen(port, () => {
  console.info(`Server running at http://${hostname}:${port}/`);
});
