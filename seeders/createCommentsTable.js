const bluebird = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: bluebird });

const dbCredentials = require('../dbCredentials/dbCredentials.js');
const db = pgp(dbCredentials);

const dropCommentsTable = `DROP TABLE IF EXISTS comments`;
const createCommentsTable = (`
  CREATE TABLE comments (
    id SERIAL PRIMARY KEY, 
    comment TEXT, 
    date_added DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    votes INT DEFAULT 0, 
    article_id INT, 
    user_id INT,
    connecting_comment_id INT,
    FOREIGN KEY (article_id) REFERENCES articles(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (connecting_comment_id) REFERENCES comments(id)
  )`
);
const seedCommentsTable = (`
  INSERT INTO comments (comment, article_id, user_id, connecting_comment_id)
  VALUES 
    ('I don''t agree with this', 1, 1, null),  
    ('They make some valid points...', 2, 2, null),
    ('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 3, 3, null),
    ('I don''t agree with this', 4, 4, null),  
    ('They make some valid points...', 5, 5, null),
    ('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 6, 1, null),
    ('I don''t agree with this', 7, 1, null),  
    ('They make some valid points...', 8, 1, null),
    ('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 9, 1, null),
    ('I don''t agree with this', 10, 1, null),  
    ('They make some valid points...', 11, 1, null),
    ('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 6, 1, null),
    ('I don''t agree with this', 12, 1, null),  
    ('They make some valid points...', 13, 1, null),
    ('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 3, 1, null),
    ('Blatant lies', 14, 1, null),
    ('I don''t agree with this', 14, 2, 16), 
    ('Down with this sort of thing', 14, 3, 17),
    ('Fake news is mean', 14, 4, 18),
    ('Putting the truth in post... with this post... because it''s true', 14, 4, 19),
    ('They make some valid points...', 15, 1, null),
    ('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 6, 1, null),
    ('I don''t agree with this', 16, 1, null),  
    ('They make some valid points...', 17, 1, null),
    ('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 3, 1, null),
    ('I don''t agree with this', 18, 1, null),  
    ('They make some valid points...', 19, 1, null),
    ('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 6, 1, null),
    ('I don''t agree with this', 20, 1, null),  
    ('They make some valid points...', 21, 1, null),
    ('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 3, 1, null),
    ('I don''t agree with this', 22, 1, null),  
    ('They make some valid points...', 23, 1, null)
    `
);

async function createComments() {
  try {
    await db.query(dropCommentsTable);
    await db.query(createCommentsTable);
    await db.query(seedCommentsTable);
    pgp.end();
    return 'comments table created';
  }
  catch (err) {
    pgp.end();
    return err;
  }
}

createComments()
  .then(result => console.log(result))
  .catch(error => new Error(error));

module.exports = createComments;
