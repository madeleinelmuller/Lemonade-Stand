// Basic React setup for the Lemonade Stand Game
class LemonadeStandGame extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            money: 5.00,
            ads: 0,
            cups: 0,
            price: 1.00,
            message: "Welcome to the Lemonade Stand! Set your prices and sell!",
        };
    }

    handleChange = (event) => {
        this.setState({ [event.target.name]: Number(event.target.value) });
    };

    startDay = () => {
        const { money, ads, cups, price } = this.state;
        const totalCost = (ads * 0.50) + (cups * 0.05);

        if (totalCost > money) {
            this.setState({ message: "Not enough money! Adjust your settings." });
            return;
        }

        const sales = Math.min(cups, Math.floor(Math.random() * 20 + 10)); // Random customer count
        const revenue = sales * price;
        const profit = revenue - totalCost;

        this.setState({
            money: money + profit,
            message: `You sold ${sales} cups and made $${profit.toFixed(2)}!`
        });
    };

    render() {
        return (
            <div>
                <h1>Lemonade Stand</h1>
                <p>Money: ${this.state.money.toFixed(2)}</p>

                <div>
                    <label>Advertising Signs ($0.50 each):</label>
                    <input type="number" name="ads" value={this.state.ads} onChange={this.handleChange} />
                </div>

                <div>
                    <label>Cups of Lemonade ($0.05 each):</label>
                    <input type="number" name="cups" value={this.state.cups} onChange={this.handleChange} />
                </div>

                <div>
                    <label>Price per Cup:</label>
                    <input type="number" name="price" value={this.state.price} onChange={this.handleChange} />
                </div>

                <button onClick={this.startDay}>Start Day</button>

                <p>{this.state.message}</p>
            </div>
        );
    }
}

ReactDOM.render(<LemonadeStandGame />, document.getElementById('root'));
