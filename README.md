Building a Telegram E-Commerce Bot with Admin Web App
Telegram is hugely popular in Ethiopia, and I saw an opportunity to create an e-commerce bot that fits perfectly into the way people already use the app.
The Development Journey
My initial goal was to quickly convert existing e-commerce websites and apps into a bot version. However, as new ideas emerged, I became eager to add more features, which extended the project timeline beyond what I originally planned.
Tech Stack
For this project, I chose Telegraf.js, a modern framework that made building the Telegram bot both easy and efficient.
On the management side, I utilized the MERN stack (MongoDB, Express.js, React.js, and Node.js).
Key Features of the Telegram E-Commerce Bot
The bot I developed is packed with features designed to enhance shopping while taking advantage of Telegram's unique strengths:
E-Commerce Capabilities:
            🔸 Product Filtering: Users can filter products by category.
🛒 Cart Management: Users can add products to their cart, adjust quantities, cancel                 orders, and reorder items.
🔎 Search: Products can be searched directly within the bot.
➡️ Pagination: Products are displayed with pagination, showing 6 items per page for smoother browsing.
🖼️ Image & Video Support: Products can be viewed with both images and videos, with the option to paginate through media.
💰 Payment Integration: The bot supports payments through Chapa and Stripe (in testing mode).
📧 User Feedback: Users can give feedback and rate the bot.
Additional Functionalities:
🌐 Localization: The bot supports both Amharic and English languages.
📢 Automated Posting: A script automatically schedules and posts products once per day.
✉️ Seamless Navigation: Users can easily move from a Telegram channel to the bot with a selected product to complete a purchase.
🖱️ Click Tracking: tracks the number of clicks by time frame, individual user, and specific scene.
🧭 Time Tracking: Its also tracks how much time users spend within a given time frame, by individual user, and per specific scene.
↗️ Referral Program with Lottery: Users can invite others to join the Telegram channel, earn a lottery number, and potentially win free products or discounts.
📊 Admin Scene: The channel admin can view new users, manage orders, and post products to the channel directly from the bot.

Admin App Overview
The admin app for the Telegram e-commerce bot has two main sections: Analysis Pages and Data Management Pages.
User Analysis Page
The User Analysis Page offers various ways to visualize the bot's performance and user engagement:
📉 User Growth Tracking: Shows how many users joined during specific time intervals and the growth rate of new sign-ups over the past month, including data for individual users.
🧭 Time Spent Analysis: Tracks how long users spend on the bot in minutes during specific intervals and shows the growth rate of time spent by users over the past month.
🖱️ Click Activity: Visualizes the number of clicks users made in different time intervals and displays the growth rate of clicks over the past month to gauge engagement.
🌐 Language Preference Visualization: Displays the distribution of users' language preferences, showing how many use Amharic versus English.
⭐️ User Rating Analysis: Provides a percentage of users who have rated the bot, offering insights into user satisfaction.
💹 User Source Tracking: Shows how users are joining the bot—whether through channels, invitations, or directly via the bot.
🏆 Top Performing Users: Highlights the top 3 users based on clicks, time spent, and total orders, useful for rewarding the most active users.
🔔 Real-Time Feedback & Response: Displays real-time user feedback with the ability to respond directly within the Telegram chat for prompt customer service.
🎁 Lottery and Invitation Management: Lets you see user participation in lotteries, track invitations, and manage prize distribution.
🌐 Localization: The admin app also supports both Amharic and English languages.
🎨 Theme Customization: Change the web app’s theme to suit your preference.

Order and Product Management
The Data Management Page includes essential functions for managing orders and products:
📊 Product Analytics:
Top Ordered Categories: Highlights the most frequently ordered product categories.
Top Ordered Products: Displays the top products ordered.
Top Clicked Products: Shows products with the most clicks.
Top Clicked Categories: Displays the most clicked product categories.
📉 Order and Transaction cards:
Completed Orders: Shows a graph of completed orders per month, compared to the previous month in percentage.
Canceled Orders: Visualizes canceled orders per month in comparison to the previous month.
Cash on Delivery Orders: Displays orders paid with cash on delivery, with a monthly graph and percentage comparison to the previous month.
Online Payment Orders: This shows online payment orders per month, compared to the last month in percentage.
Total Transactions: Visualizes the total number of transactions per month with a percentage comparison to the previous month in percentage.
📊 Order Status Overview: Provides a view of order statuses, including pending, canceled, completed, and delivered.
🎟️ Completed vs. Canceled Orders: Compares completed and canceled orders over specific time frames.
📼 Cash vs. Online Payments: Compares cash on delivery and online payments over specific time frames.
Data Management Page
The Data Management Page offers complete control over the bot’s data, featuring:
⚙️ CRUD Operations: Manage admins, categories, and products by creating, reading, updating, or deleting them.
🎟️ Order Management: View and filter orders extensively. You can also send updates directly from the web app to the bot, keeping users informed about their order status in real-time.
📼 Payment Transactions: See payment transactions displayed in a table format, making it easy to monitor and manage.
🔔 Feedback Management: Respond to user feedback from the web app, and these responses are sent directly to users' bots.
You can view the project through a video recording or on the provided link
If you’re interested in collaborating, contributing, or using this project for personal purposes, feel free to contact me.



