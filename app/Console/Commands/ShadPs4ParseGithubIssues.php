<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use GuzzleHttp\Client;
use Illuminate\Support\Str;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ShadPs4ParseGithubIssues extends Command
{
    protected $signature = 'shadps4:parse-github-issues';
    protected $description = 'Fetch issues from GitHub and parse them';

    public function handle()
    {
        logger(sprintf('Running %s', $this->signature));

        $client = new Client();
        $page = 1;
        $allIssues = [];

        do {
            $response = $client->get("https://api.github.com/repos/shadps4-emu/shadps4-game-compatibility/issues", [
                'query' => ['page' => $page, 'per_page' => 100]
            ]);

            $issues = json_decode($response->getBody(), true);

            foreach ($issues as $issue) {
                $parsedIssue = $this->parseIssue($issue);
                // dd($parsedIssue);
                $allIssues[] = $parsedIssue;
            }

            $page++;
        } while (count($issues) > 0);

        // sort by updated_at desc
        usort($allIssues, function ($a, $b) {
            return strtotime($b['updated_at']) - strtotime($a['updated_at']);
        });

        logger(sprintf('Fetched %d issues', count($allIssues)));

        // Save issues to a JSON file
        File::put(public_path('shadps4/shadps4-issues.json'), json_encode($allIssues, JSON_PRETTY_PRINT));
        $this->info('Issues fetched and saved to shadps4-issues.json successfully!');
    }

    private function parseIssue($issue)
    {
        // dd($issue);

        // if($issue['title'] === 'CUSA06997 - YAKUZA KIWAMI') {
        //     dd($issue);
        // }

        $parsedBody = $this->parseBody($issue);

        return [
            'url' => $issue['html_url'],
            'submitter' => $issue['user']['login'],
            'title' => $issue['title'],
            'labels' => $issue['labels'] ? collect($issue['labels'])->map(function ($issue) {
                return [
                    'name' => $issue['name'],
                    'color' => $issue['color'],
                ];
            }) : [],
            'body' => $parsedBody,
            'updated_at' => Carbon::parse($issue['updated_at'])->format('Y-m-d H:i:s'),
        ];
    }

    private function parseBody($issue)
    {
        $fields = [
            'Game Name' => null,
            'Game code' => null,
            'Game version' => null,
            'Used emulator\'s version' => null,
            'Current status' => null,
            'Error' => null,
            'Description' => null,
            'Screenshots' => null,
            'Log File' => null,
        ];

        $sections = preg_split('/### /', $issue['body']);
        array_shift($sections); // Remove the first empty element

        foreach ($fields as $field => &$value) {
            foreach ($sections as $section) {
                if (strpos($section, $field) === 0) {
                    $value = trim(substr($section, strlen($field)));
                }
            }
        }

        $snakeCaseFields = [];
        foreach ($fields as $key => $value) {
            $snakeCaseKey = Str::snake($key);
            $snakeCaseFields[$snakeCaseKey] = $value;
        }

        $snakeCaseFields['screenshots'] = $this->extractImageUrls($snakeCaseFields['screenshots']);

        // roy($snakeCaseFields['screenshots']);

        return $snakeCaseFields;
    }

    public function extractImageUrls($content)
    {
        $pattern = '/!\[.*?\]\((https?:\/\/[^\s]+)\)/';
        preg_match_all($pattern, $content, $matches);
        return $matches[1] ?? [];
    }
}
