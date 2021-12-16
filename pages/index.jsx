import useSWR from "swr";
import { useState, useEffect } from "react";
import moment from "moment";

// TODO: Favourites

const fetcher = (...args) => fetch(...args).then((res) => res.json());

const Article = ({ id, index }) => {
  const { data, error } = useSWR(
    `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
    fetcher
  );

  const dynamicClasses = (index) =>
    `pt-4 space-y-2 animate-pulse animate-delay-${(index % 10) * 100}`;

  if (error) return <></>;

  // Render loading animation
  if (!data)
    return (
      <article className={dynamicClasses(index)}>
        <div className="text-xs uppercase bg-gray-100/25 rounded h-4 w-20"></div>
        <h2 className="text-white font-light bg-gray-100/25 rounded h-4"></h2>
        <div className="flex space-x-4">
          <div className="flex flex-col">
            <span className="text-sm bg-gray-100/25 rounded h-4 w-16"></span>
            <span className="text-xs bg-gray-100/25 rounded h-4 w-12 mt-2"></span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm bg-gray-100/25 rounded h-4 w-16"></span>
            <span className="text-xs bg-gray-100/25 rounded h-4 w-12 mt-2"></span>
          </div>
        </div>
      </article>
    );

  return (
    <article className="pt-4">
      <a
        className="space-y-2"
        href={data.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="text-xs uppercase">{data.type}</div>
        <h2 className="text-white font-light">{data.title}</h2>
        <div className="flex space-x-4">
          <ArticleDetails title="Score" value={data.score} />
          <ArticleDetails
            title="Posted"
            value={moment.unix(data.time).format("lll")}
          />
        </div>
      </a>
    </article>
  );
};

const ArticleDetails = ({ value, title }) => {
  return (
    <div className="flex flex-col">
      <span className="text-sm">{value}</span>
      <span className="text-xs">{title}</span>
    </div>
  );
};

const HomePage = ({ articles, crypto }) => {
  const [numStories, setNumStories] = useState(3);

  const classGenerator = (value) =>
    value > 0
      ? "text-sm flex gap-1 items-center text-green-500"
      : "text-sm flex gap-1 items-center text-red-500";

  return (
    <>
      {/* Crypto Ticker */}
      <marquee scrollamount="2">
        <ul className="flex space-x-6">
          {crypto.data.map((token) => (
            <li
              key={token.id}
              className={classGenerator(token.quote.USD.percent_change_24h)}
            >
              <img
                src={`https://cryptoicon-api.vercel.app/api/icon/${token.symbol.toLowerCase()}`}
                alt={`${token.symbol} logo`}
                className="h-4 w-4"
              />
              <div>{token.symbol}</div>
              <div>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(token.quote.USD.price)}{" "}
                <span className="text-xs font-light">
                  {new Intl.NumberFormat("en-US", {
                    style: "decimal",
                  }).format(token.quote.USD.percent_change_24h)}
                  %
                </span>
              </div>
            </li>
          ))}
        </ul>
      </marquee>

      {/* Articles */}
      <div className="mx-4 mt-4">
        <h2 className="text-lg font-medium">Top Stories</h2>
        <main className="flex flex-col space-y-4 text-gray-400 divide-y divide-gray-700">
          {articles.map((articleId, index) => (
            <Article key={articleId} id={articleId} index={index} />
          ))}
        </main>
      </div>
    </>
  );
};

export default function App({ articles, crypto }) {
  const dayString = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
  const [page, setPage] = useState("home");
  const [date, setDate] = useState(new Date());
  const [temp, setTemp] = useState();

  // Fetch weather
  useEffect(async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;

        (async () => {
          const temperature = await fetch(
            `/api/weather?lat=${latitude}&lng=${longitude}`
          )
            .then((res) => res.json())
            .then((res) => res.message.main.temp);
          setTemp(temperature);
        })();
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 flex justify-between items-center uppercase">
        <h1>Newsday</h1>
        <div className="text-xs flex flex-col text-right">
          <span>{`${date.getDate()} ${dayString[date.getDay()]}`}</span>
          {temp && <span>{temp}&deg;</span>}
        </div>
      </header>

      {page == "home" && <HomePage articles={articles} crypto={crypto} />}
    </div>
  );
}

// This gets called on every request
export async function getServerSideProps() {
  const newsRes = await fetch(
    "https://hacker-news.firebaseio.com/v0/topstories.json"
  );
  const cryptoRes = await fetch(
    `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=20&CMC_PRO_API_KEY=${process.env.COINMARKETCAP_KEY}`
  );

  const articles = await newsRes.json();
  const crypto = await cryptoRes.json();

  // Pass data to the page via props
  return {
    props: {
      articles,
      crypto,
    },
  };
}
