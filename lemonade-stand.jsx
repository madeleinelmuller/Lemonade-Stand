import React, { useState } from 'react';
import { motion } from "framer-motion";
import {
  Sun,
  ThermometerSun,
  Wind,
  Cloud,
  CloudRain,
  CloudLightning,
  DollarSign,
  Megaphone,
  CupSoda
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Weather data
const weatherTypes = [
  {
    type: "Hot",
    baseCustomers: 40,
    multiplier: 1.5,
    icon: <ThermometerSun className="inline-block mr-1" size={18} />,
  },
  {
    type: "Sunny",
    baseCustomers: 30,
    multiplier: 1.2,
    icon: <Sun className="inline-block mr-1" size={18} />,
  },
  {
    type: "Mild",
    baseCustomers: 25,
    multiplier: 1.0,
    icon: <Cloud className="inline-block mr-1" size={18} />,
  },
  {
    type: "Windy",
    baseCustomers: 20,
    multiplier: 0.7,
    icon: <Wind className="inline-block mr-1" size={18} />,
  },
  {
    type: "Rainy",
    baseCustomers: 15,
    multiplier: 0.5,
    icon: <CloudRain className="inline-block mr-1" size={18} />,
  },
  {
    type: "Stormy",
    baseCustomers: 8,
    multiplier: 0.3,
    icon: <CloudLightning className="inline-block mr-1" size={18} />,
  },
];

// Daily overhead cost to discourage skipping
const DAILY_OVERHEAD = 0.25;
// Minimum cost for a single cup
const CUP_COST = 0.05;
// Minimum cost for a single ad
const AD_COST = 0.5;
// Minimum money needed to buy at least 1 cup
const MIN_REQUIRED_MONEY = CUP_COST;

// Map weather type to background gradient classes
function getBackgroundGradient(weatherType) {
  switch (weatherType) {
    case "Hot":
      return "from-orange-500 via-orange-300 to-orange-200";
    case "Sunny":
      return "from-yellow-300 via-yellow-200 to-orange-100";
    case "Mild":
      return "from-teal-100 to-white";
    case "Windy":
      return "from-gray-200 to-blue-50";
    case "Rainy":
      return "from-blue-300 to-blue-100";
    case "Stormy":
      // More dramatic contrast
      return "from-gray-800 via-gray-900 to-black";
    default:
      return "from-teal-100 to-white";
  }
}

// Dynamic button styles based on forecast type
function getButtonClass(weatherType) {
  switch (weatherType) {
    case "Hot":
      return "bg-orange-600 hover:bg-orange-500 text-white border border-orange-700";
    case "Sunny":
      return "bg-yellow-400 hover:bg-yellow-300 text-black border border-yellow-500";
    case "Mild":
      return "bg-teal-400 hover:bg-teal-300 text-white border border-teal-500";
    case "Windy":
      return "bg-blue-200 hover:bg-blue-300 text-blue-900 border border-blue-400";
    case "Rainy":
      return "bg-blue-500 hover:bg-blue-400 text-white border border-blue-700";
    case "Stormy":
      return "bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-600";
    default:
      return "bg-blue-500 hover:bg-blue-400 text-white border border-blue-700";
  }
}

function generateWeather() {
  // Return a random weather from the array
  return weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
}

function getActualWeather(forecast) {
  // 80% chance to use the given forecast, else random
  const r = Math.random();
  if (r < 0.8) {
    return forecast;
  } else {
    return generateWeather();
  }
}

const LemonadeStandGame = () => {
  // Starting money
  const [money, setMoney] = useState(5.0);
  // Track each day's performance; keep full but only display last 5
  const [history, setHistory] = useState([]);
  // Current weather forecast
  const [forecast, setForecast] = useState(generateWeather());

  // Inputs for daily planning
  const [ads, setAds] = useState(0);
  const [cups, setCups] = useState(0);
  const [price, setPrice] = useState(1.0);

  // Track current day count, so we don't rely on history length
  const [dayCount, setDayCount] = useState(1);

  // Game Over state
  const [gameOver, setGameOver] = useState(false);

  // Helper to calculate planned daily cost
  const plannedDailyCost = DAILY_OVERHEAD + ads * AD_COST + cups * CUP_COST;

  // Handle user input for ads
  const handleAdsChange = (e) => {
    const nextAds = Math.max(0, Number(e.target.value));
    setAds(nextAds);
  };

  // Handle user input for cups
  const handleCupsChange = (e) => {
    const nextCups = Math.max(0, Number(e.target.value));
    setCups(nextCups);
  };

  // Handle user input for price (no minimum)
  const handlePriceChange = (e) => {
    const val = Number(e.target.value);
    setPrice(val < 0 ? 0 : val); // At least 0 if you want to prevent negative pricing
  };

  // Start the day logic
  const playDay = () => {
    // Check if the player can afford the chosen plan
    if (plannedDailyCost > money) {
      alert("You don't have enough money for these purchases.");
      return;
    }

    // Determine actual weather
    const actualWeather = getActualWeather(forecast);

    // Calculate how many extra customers from ads (with diminishing returns)
    // On Windy days, ads are only 50% effective
    const adEffectiveness = actualWeather.type === "Windy" ? 0.5 : 1;
    const potentialAdCustomers = Math.min(ads * 3 * adEffectiveness, 30);

    // Calculate demand before price penalty
    const demandBeforePrice = (actualWeather.baseCustomers + potentialAdCustomers) * actualWeather.multiplier;

    // Price penalty: for each dollar above $1, reduce by 20%
    // (We keep the formula but there's no enforced min price now)
    const pricePenalty = price <= 1 ? 0 : (price - 1) * 0.2;

    // Potential customers after price effect
    const potentialCustomers = Math.max(0, Math.floor(demandBeforePrice * (1 - pricePenalty)));

    // Actual sales can't exceed cups prepared
    const sales = Math.min(potentialCustomers, cups);

    // Calculate revenue and net profit
    const revenue = sales * price;
    const profit = revenue - plannedDailyCost;

    // Update money
    const newMoney = money + profit;

    // Update day history
    const dayRecord = {
      day: dayCount,
      forecast: forecast.type,
      actualWeather: actualWeather.type,
      ads,
      cups,
      price,
      sales,
      revenue: revenue.toFixed(2),
      cost: plannedDailyCost.toFixed(2),
      profit: profit.toFixed(2),
      finalMoney: newMoney.toFixed(2),
    };

    setHistory((prev) => [...prev, dayRecord]);

    // Increment day count
    setDayCount((prev) => prev + 1);

    // Update money state
    setMoney(newMoney);

    // Prepare for next day
    setForecast(generateWeather());
    setAds(0);
    setCups(0);
    setPrice(1.0);

    // Check game over condition
    if (newMoney < MIN_REQUIRED_MONEY) {
      setGameOver(true);
    }
  };

  // If game is over, disable Start Day button
  const canPlay = !gameOver && money >= MIN_REQUIRED_MONEY;

  // We only display last 5 records in reverse order (newest on top)
  const displayHistory = [...history.slice(-5)].reverse();

  // Helper to map weather type to icon
  const getWeatherIcon = (type) => {
    const found = weatherTypes.find((w) => w.type === type);
    return found ? found.icon : null;
  };

  const currentBgGradient = getBackgroundGradient(forecast.type);
  // If forecast is Stormy, apply lighter text overall
  const textClass = forecast.type === "Stormy" ? "text-gray-100" : "text-gray-800";
  const buttonClass = getButtonClass(forecast.type);

  return (
    <div className={`min-h-screen w-full p-6 bg-gradient-to-b ${currentBgGradient} ${textClass}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        <h1 className="text-4xl font-bold text-center mb-2">Lemonade Stand</h1>
        <Card className="bg-white shadow-xl rounded-2xl text-black pt-4">
          <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between flex-wrap">
            <div className="flex flex-col items-start justify-center space-y-1">
              <p className="text-lg font-semibold">Day: {dayCount}</p>
              <p className="text-lg font-semibold flex items-center">
                <DollarSign className="inline-block mr-1" size={18} /> Money: ${money.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center text-lg font-semibold">
              {forecast.icon}
              Forecast: {forecast.type}
            </div>
            {gameOver && (
              <p className="text-red-600 font-bold mt-3 text-center w-full md:w-auto">
                Game Over! You don't have enough money to continue.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Three input cards in a grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Ads Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -2 }}
          >
            <Card className="shadow-md rounded-2xl text-black transition-transform h-full">
              <CardContent className="flex flex-col justify-between h-full pt-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center space-x-2">
                    <Megaphone size={24} />
                    <label className="block font-semibold text-center">Advertising Signs</label>
                  </div>
                  <Input
                    type="number"
                    value={ads}
                    min="0"
                    onChange={handleAdsChange}
                    disabled={gameOver}
                    className="text-center"
                  />
                  <small className="text-gray-600">($0.50 each)</small>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Cups Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ y: -2 }}
          >
            <Card className="shadow-md rounded-2xl text-black transition-transform h-full">
              <CardContent className="flex flex-col justify-between h-full pt-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center space-x-2">
                    <CupSoda size={24} />
                    <label className="block font-semibold text-center">Cups of Lemonade</label>
                  </div>
                  <Input
                    type="number"
                    value={cups}
                    min="0"
                    onChange={handleCupsChange}
                    disabled={gameOver}
                    className="text-center"
                  />
                  <small className="text-gray-600">($0.05 each)</small>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Price Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ y: -2 }}
          >
            <Card className="shadow-md rounded-2xl text-black transition-transform h-full">
              <CardContent className="flex flex-col justify-between h-full pt-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center space-x-2">
                    <DollarSign size={24} />
                    <label className="block font-semibold text-center">Price per Cup</label>
                  </div>
                  <Input
                    type="number"
                    value={price}
                    step="0.1"
                    onChange={handlePriceChange}
                    disabled={gameOver}
                    className="text-center"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Preview daily cost */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex flex-col items-center justify-center"
        >
          <p className="text-base mt-2">
            Day's Total Planned Cost: <span className="font-semibold">${plannedDailyCost.toFixed(2)}</span>
          </p>
          <Button
            onClick={playDay}
            disabled={!canPlay}
            className={`${buttonClass} rounded-full px-6 py-2 mt-2 transition-transform transform hover:scale-105`}
          >
            Start Day
          </Button>
        </motion.div>

        {/* History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <h2 className="text-xl font-bold mb-3 mt-6">History (Last 5 Days)</h2>
          {displayHistory.map((entry) => (
            <motion.div
              key={entry.day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-4 shadow-md rounded-2xl text-black">
                <CardContent className="space-y-1">
                  <p className="font-semibold">Day {entry.day}</p>
                  <p className="flex items-center">
                    {getWeatherIcon(entry.forecast)} Forecast: {entry.forecast}
                  </p>
                  <p className="flex items-center">
                    {getWeatherIcon(entry.actualWeather)} Actual Weather: {entry.actualWeather}
                  </p>
                  <p>Ads Purchased: {entry.ads}</p>
                  <p>Cups Prepared: {entry.cups}</p>
                  <p>Price per Cup: ${entry.price.toFixed(2)}</p>
                  <p>Sales: {entry.sales}</p>
                  <p>Revenue: ${entry.revenue}</p>
                  <p>Cost: ${entry.cost}</p>
                  <p>Profit: ${entry.profit}</p>
                  <p className="font-semibold">Money After Day: ${entry.finalMoney}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LemonadeStandGame;


