global._babelPolyfill || require('babel-polyfill');

const bluebird = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: bluebird });

const dbCredentials = require('../dbCredentials/dbCredentials.js');
const db = pgp(dbCredentials);

const dropArticlesTable = `DROP TABLE IF EXISTS articles`;
const createArticlesTable = `
  CREATE TABLE articles (
    id SERIAL PRIMARY KEY, 
    href TEXT UNIQUE, 
    title TEXT,
    description TEXT,
    is_fake BOOLEAN DEFAULT false,
    pending BOOLEAN DEFAULT true,
    user_id INT,
    domain_id INT,
    post_date DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (domain_id) REFERENCES domains(id)
  )`;
const seedArticlesTable = `
  INSERT INTO articles (href, title, description, user_id, domain_id, is_fake, pending)
  VALUES 
    ('www.bbc.co.uk/news/world-europe-39802776', 'French election: Macron and Le Pen both claim debate success', 'Article relating to the French elections', 1, 1, true, true), 

    ('www.bbc.co.uk/news/business-39803515', 'Mortgage approvals dip for second month','Article regarding mortgage approval rates consistently dipping', 2, 1, true, false), 

    ('edition.cnn.com/videos/cnnmoney/2017/05/04/steve-bannon-whiteboard-corden-noah-fsc-orig-vstop.cnn', 'Late night spoofs Steve Bannon''s whiteboard', 'Mocking steve bannon in the white house with his to-do lists', 3, 2, true, true), 

    ('edition.cnn.com/2017/05/04/health/swimming-pool-urine-sweetener-study/index.html', 'A not-so-sweet new way to test for pee in pools', 'A new way to see if people are peeing in your pool!', 1, 2, true, false), 

    ('edition.cnn.com/2017/05/03/travel/japan-luxury-shiki-shima-train/index.html', 'shiki-shima: Has Japan just launched the world''s most luxurious train?', 'Luxury train in Japan is being showcased', 1, 2, true, true),

    ('edition.cnn.com/2017/05/04/politics/health-care-vote/index.html', 'Countdown is on to nail-biter Obamacare repeal vote', 'News rearding the great repeal of ObamaCare', 4, 2, true, false),

    ('money.cnn.com/2017/05/03/technology/google-docs-phishing-attack/index.html', 'Major phishing attack targeted Google Docs users', 'Major potential cyber attacks through google docs', 5, 2, true, true),
    
    ('www.dailymail.co.uk/news/article-4472816/Mother-26-left-penniless-flight-change-error.html', 'Mother, 26, who took her friend''s seat on a Ryanair flight to Ibiza is left almost penniless after the airline charged her £1,000 to change a name on a £40 ticket', 'Ryanair charging customers unfairly' ,1 , 3, true, false),

    ('www.dailymail.co.uk/news/article-4472426/Mother-38-finds-spider-living-ear.html', 'Mother, 38, who went to see a doctor complaining of a pain in her ear is stunned to find a SPIDER living in there', 'Article proven to be false as it was not a spider it was something else...', 3, 3, true, true),
    
    ('www.foxnews.com/us/2017/05/04/us-air-force-jets-intercept-russian-bombers-fighter-jets-near-alaska.html', 'Russian bombers, fighter jets fly near Alaska, prompting Air Force escort', 'Russian bombers near Alaska', 4, 4, false, false),

    ('www.foxnews.com/us/2017/05/04/anti-trump-course-at-butler-university-offers-strategies-for-resistance.html', 'Anti-Trump course at Butler University offers ''strategies for resistance'' ', 'Anti-Trump alegations', 2, 4, true, true),

    ('www.huffingtonpost.co.uk/entry/prince-philip_uk_590aed14e4b05c3976866286?aovo&utm_hp_ref=uk', 'Prince Philip, Duke of Edinburgh, To Step Down From Royal Duties, Buckingham Palace Announces', 'Official announcement from Buckingham Palace', 1, 5, false, false),

    ('www.huffingtonpost.co.uk/entry/marine-le-pen-egged_uk_590b2172e4b05c397686c73a?utm_hp_ref=uk', 'Marine Le Pen Egged During French Presidential Election Campaign Appearance', 'Update on French election', 4, 5, true, true),

    ('www.thesun.co.uk/news/3479706/uk-weather-forecast-weekend-may-latest/', 'Brits will bask in glorious sunshine with temperatures set to soar to 17C this weekend', 'Unusual activity regarding weather in UK', 1, 6, true, false),

    ('www.thesun.co.uk/news/3481852/jeremy-corbyn-snapped-pushing-kids-on-a-swing-in-oxford-east-a-safe-labour-seat-with-a-majority-of-15000/', 'Jeremy Corbyn snapped pushing kids on a swing in Oxford East – a SAFE Labour seat with a majority of 15,000', 'UK election update', 2, 6, true, true),

    ('www.nbcnews.com/news/world/trump-meet-palestinian-leader-abbas-wants-mideast-peace-deal-n753806', 'Trump Meets Palestinian Leader Abbas and Wants Mideast Peace Deal', 'Trump working on Peace Deal', 3, 7, true, false),

    ('www.nbcnews.com/politics/politics-news/house-republicans-vote-health-care-thursday-n754601', 'House Republicans to Vote on Health Care on Thursday', 'Voting on Health Case in US', 4, 7, true, true),

    ('www.telegraph.co.uk/news/2017/05/04/donald-trumps-arm-twisting-means-healthcare-legislation-will/', 'Donald Trump''s arm-twisting means healthcare legislation ''will be passed''', 'Healthcare update in the US', 2, 8, true, false),

    ('www.telegraph.co.uk/news/2017/05/04/ford-galaxy-turned-polling-station-council-election-building/', 'Ford Galaxy turned into polling station for council election after building mistakenly locked', 'Car is turned into a polling station', 1, 8, true, true),

    ('www.thetimes.co.uk/edition/news/obama-proposed-to-white-girlfriend-before-michelle-26jm0xq5g', 'Barack Obama ‘used cocaine later into life than he admitted', 'Allegations about Obama', 1, 9, true, false),

    ('www.thetimes.co.uk/edition/news/brussels-is-meddling-in-our-election-warns-may-s6gc5j62v', 'Brussels is meddling in our election, warns PM', 'Prime minister hits back at EU officials ''who do not want Britain to prosper''', 2, 9, true, true),

    ('www.theguardian.com/world/2017/may/04/un-accuses-saudi-arabia-of-using-terror-laws-to-suppress-free-speech', 'UN accuses Saudi Arabia of using terror laws to suppress free speech', 'Report also criticises kingdom for failing to carry out independent inquiries into its bombing raids in Yemen', 1, 10, true, false),

    ('www.theguardian.com/media/2017/may/04/uk-tv-top-jobs-itv-channel-4-stv-sky-bbc', 'TV''s got talent: top jobs in UK broadcasting up for grabs', 'ITV, Channel 4 and STV are all seeking new chief executives and top roles at Sky and BBC may be available within the next year', 2, 10, true, true)`;

async function createArticles() {
  try {
    await db.query(dropArticlesTable);
    await db.query(createArticlesTable);
    await db.query(seedArticlesTable);
    pgp.end();
    return 'articles table created';
  }
  catch (err) {
    pgp.end();
    return err;
  }
}

createArticles()
  .then(result => console.log(result))
  .catch(error => new Error(error));

module.exports = createArticles;

