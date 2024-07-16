# Monthly Expenses Tracker 🚀

## Description:
Welcome to *Monthly Expenses Tracker* bot! This Telegram bot helps you manage your daily expenses by taking commands and editing a spreadsheet accordingly. It's a convenient tool to keep track of your spending and stay on top of your finances.

## Features

- **Log in**: Securely log in to your account.
- **Create Spreadsheet**: Create a new spreadsheet to track your expenses.
- **Add Expenses**: Add expenses by category, amount, and payment method.
- **Edit Expenses**: Edit expenses for specific dates.
- **Get Spreadsheet**: Retrieve the current expense spreadsheet.

## Tech Stack

- **Node.js**: Backend server
- **Telegraf**: Telegram bot framework
- **Google Sheets API**: To manage the expense spreadsheet
- **Various npm packages**: For handling API requests and other functionalities

## Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/expense-tracker-bot.git
    cd expense-tracker-bot
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Set up environment variables:**
    Create a `.env` file in the root directory and add your Telegram bot token and Google Sheets API credentials.
    ```env
        `telegram secret`
    BOT_TOKEN=your_telegram_bot_token
        `superbase secret`
    SUPABASE_API_KEY=your_superbase_api_key
    DATABASE_URL = your_database_url
    SUPABASE_URL=your_superbase_url
        `google secret`
    client_id=your_client_id
    project_id=your_project_id
    client_secret=your_client_secret
    redirect_uris=your_redirect_url
    ```

4. **Run the bot:**
    ```bash
    npm start
    ```

## Usage

### Start Command

When you start the bot, you'll see the following message:


### Commands

- **/log_in**: Log in to your account.
- **/create_spread_sheet**: Create a new spreadsheet for tracking expenses.
- **/add category amount paymentMethod**: Add an expense.
  - Example: `/add groceries 7000 online`
- **/edit date category amount paymentMethod**: Edit an expense for a specific date.
  - Example: `/edit 24/6/2024 groceries 7000 online`
- **/get_spread_sheet**: Retrieve the current expense spreadsheet.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

1. **Fork the repository.**
2. **Create a new branch:**
    ```bash
    git checkout -b feature/your-feature-name
    ```
3. **Commit your changes:**
    ```bash
    git commit -m 'Add some feature'
    ```
4. **Push to the branch:**
    ```bash
    git push origin feature/your-feature-name
    ```
5. **Open a pull request.**

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Thanks to the developers of Node.js, Telegraf, and Google Sheets API for their excellent tools.
- Special thanks to the open-source community for providing helpful libraries and resources.

## Contact

For any questions or suggestions, feel free to open an issue or contact me at tamoghna171099@gmail.com.
