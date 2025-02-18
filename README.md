# ShadPS4 Compatibility List

This is a fan-made compatibility list for ShadPS4. The list is generated from GitHub issues and can be updated automatically.

## How it works

This project uses a Laravel installation for simplicity. There are only 5 main files involved:

1. `public/shadps4/index.html`: The main HTML file that loads a few dependencies (tailwind, ag-grid)
2. `public/shadps4/app.shadps4.js`: JavaScript file that configures ag-grid and handles all the formatting.
3. `public/shadps4/shadps4-issues.json`: JSON file generated from the Laravel command (not included)
4. `app/Console/Commands/ShadPs4ParseGithubIssues.php`: Laravel command to parse GitHub issues and generate the JSON file.
5. `app/Console/Commands/ShadPs4ExportDiscordChannel.php`: Laravel command to extract images from the Discord channel (WIP, does not work).

## Setup and Usage

1. Clone the repository:
git clone https://github.com/facesofgaming/shadps4-compat-list
cd shadps4-compat-list


2. Install dependencies:
composer install


3. Generate an up-to-date `shadps4-issues.json`:
php artisan shadps4:parse-github-issues


Note: You can easily get rate-limited by GitHub. Using a GitHub token would allow you to call this command more often.

4. (Optional) Schedule the command to run automatically:
You can schedule the command to run hourly or daily by adding it to your Laravel scheduler.
https://laravel.com/docs/11.x/scheduling

## Important Notes

- This is a fan-made project and is not officially associated with ShadPS4.
- The compatibility list is generated based on GitHub issues and may not always be 100% accurate or up-to-date.
- Be mindful of GitHub's rate limits when running the parsing command frequently.

## Contributing

Contributions are welcome... I will try and get to the PRs in a timely fashion. No promises!

## License

MIT License