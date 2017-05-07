const bluebird = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: bluebird });

const dbCredentials = require('../dbCredentials/dbCredentials.js');
const db = pgp(dbCredentials);

const dropDomainsTable = `DROP TABLE IF EXISTS domains`;
const createDomiansTable = `
  CREATE TABLE domains (
    id SERIAL PRIMARY KEY,
    domain TEXT UNIQUE,
    reliability INT DEFAULT 0, 
    organisation TEXT, 
    org_description TEXT,
    article_count INT DEFAULT 0,
    date_added DATE NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`;
const seedDomainsTable = `
  INSERT INTO domains (domain, article_count, organisation, org_description) 
  VALUES 

    ('www.bbc.co.uk/news', 2, 'BBC News', 'BBC News is an operational business division of the British Broadcasting Corporation (BBC) responsible for the gathering and broadcasting of news and current affairs. The department is the world''s largest broadcast news organisation and generates about 120 hours of radio and television output each day, as well as online news coverage.  The service maintains 50 foreign news bureaux with more than 250 correspondents around the world.  James Harding has been Director of News and Current Affairs since April 2013.'), 

    ('edition.cnn.com/', 2, 'CNN', 'The Cable News Network (CNN) is an American basic cable and satellite television news channel owned by the Turner Broadcasting System division of Time Warner.  It was founded in 1980 by American media proprietor Ted Turner as a 24-hour cable news channel.'),

    ('www.dailymail.co.uk/home/index.html', 2, 'Daily Mail', 'The Daily Mail is a British daily middle-market tabloid newspaper owned by the Daily Mail and General Trust and published in London. First published in 1896 by Alfred Harmsworth, 1st Viscount Northcliffe, and his brother Harold Harmsworth, 1st Viscount Rothermere, it is the United Kingdom''s second biggest-selling daily newspaper after The Sun.  Jonathan Harmsworth, 4th Viscount Rothermere, a great-grandson of the one of the co-founders, is the current chairman and controlling shareholder of the Daily Mail and General Trust, though day-to-day editorial decisions for the newspaper are usually made by a team around the editor, Paul Dacre.'),

    ('www.foxnews.com/', 2, 'Fox News', 'Fox News (officially known as the Fox News Channel) is an American basic cable and satellite news television channel owned by the Fox Entertainment Group, a subsidiary of 21st Century Fox.  The channel was created by Australian-American media mogul Rupert Murdoch, who hired former Republican Party media consultant and CNBC executive Roger Ailes as its founding CEO.  It launched on October 7, 1996, to 17 million cable subscribers.  It grew during the late 1990s and 2000s to become a dominant cable news network in the United States.  Rupert Murdoch is the current chairman and acting CEO of Fox News'),

    ('www.huffingtonpost.co.uk/', 2, 'HuffPost', 'HuffPost (formerly The Huffington Post and sometimes abbreviated HuffPo) is a politically liberal American online news aggregator and blog that has both localized and international editions founded by Arianna Huffington, Kenneth Lerer, Jonah Peretti, and Andrew Breitbart, featuring columnists. The site offers news, satire, blogs, and original content and covers politics, business, entertainment, environment, technology, popular media, lifestyle, culture, comedy, healthy living, women''s interests, and local news.'),

    ('www.thesun.co.uk/', 2, 'The Sun', 'The Sun is a tabloid published in the United Kingdom and Ireland. Since The Sun on Sunday was launched in February 2012, the paper has been a seven-day operation. As a broadsheet, it was founded in 1964 as a successor to the Daily Herald; it became a tabloid in 1969 after it was purchased by its current owners. It is published by the News Group Newspapers division of News UK, itself a wholly owned subsidiary of Rupert Murdoch''s News Corp.'),

    ('www.nbcnews.com/', 2, 'NBC News', 'NBC News is a division of the American broadcast network NBC. The division operates under NBCUniversal News Group, a subsidiary of NBCUniversal, in turn a subsidiary of Comcast. The group''s various operations report to the president of NBC News, Noah Oppenheim.[1]
    NBC News aired the first news program in American broadcast television history on February 21, 1940. The group''s broadcasts are produced and aired from 30 Rockefeller Center, NBC''s headquarters in New York City.'),

    ('www.telegraph.co.uk/', 2, 'The Telegraph', 'The Daily Telegraph, commonly referred to simply as The Telegraph, is a national British daily broadsheet newspaper published in London by Telegraph Media Group and distributed across the United Kingdom and internationally. It was founded by Arthur B. Sleigh in 1855 as The Daily Telegraph and Courier.  The paper had a circulation of 460,054 in December 2016, following industry trends has declined from 1.4 million in 1980. Its sister paper, The Sunday Telegraph, which started in 1961, had a circulation of 359,287 as of December 2016.'),

    ('www.thetimes.co.uk/', 2, 'The Times', 'The Times is a British daily (Monday to Saturday) national newspaper based in London, England. It began in 1785 under the title The Daily Universal Register, adopting its current name on 1 January 1788. The Times and its sister paper The Sunday Times (founded in 1821) are published by Times Newspapers, since 1981 a subsidiary of News UK, itself wholly owned by News Corp. The Times and The Sunday Times do not share editorial staff, were founded independently and have only had common ownership since 1967.'),

    ('www.theguardian.com/uk', 2, 'The Guardian', 'The Guardian is a British daily newspaper, known from 1821 until 1959 as the Manchester Guardian. Along with its sister papers The Observer and The Guardian Weekly, The Guardian is part of the Guardian Media Group, owned by The Scott Trust Limited. The Trust was created in 1936 "to secure the financial and editorial independence of The Guardian in perpetuity and to safeguard the journalistic freedom and liberal values of The Guardian free from commercial or political interference." The Scott Trust became a limited company in 2008, with a constitution to maintain the same protections for The Guardian. Profits are reinvested in journalism rather than to the benefit of an owner or shareholders.')

  ON CONFLICT DO NOTHING`;

async function createDomains() {
  try {
    await db.query(dropDomainsTable);
    await db.query(createDomiansTable);
    await db.query(seedDomainsTable);
    pgp.end();
    return 'domains table created';
  }
  catch (err) {
    pgp.end();
    return err;
  }
}

createDomains()
  .then(result => console.log(result))
  .catch(error => new Error(error));

module.exports = createDomains;