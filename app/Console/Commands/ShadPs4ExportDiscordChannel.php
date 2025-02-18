<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

/**
 * IDEA (WIP)
 *
 * Export Discord images with https://github.com/Tyrrrz/DiscordChatExporter/releases
 * Then either analyze the post to try and decipher which game they belong to, OR use an AI Vision model to perform OCR on the game title in the screenshot (almost always present),
 */
class ShadPs4ExportDiscordChannel extends Command
{
    protected $signature = 'export:discord';
    protected $description = 'Export Discord chat to HTML and JSON formats';

    public function handle()
    {
        $token = '<YOUR DISCORD TOKEN>';
        $channelId = '<YOUR DISCORD CHANNEL ID>';

        $command = sprintf(
            '/Users/<YOUR USER>/Downloads/DiscordChatExporter.Cli.osx-arm64/DiscordChatExporter.Cli export -t %s -c %s %s --after %s',
            // '-o myserver.html',
            $token,
            $channelId,
            '-f json',
            '2024-08-13', // since date
        );

        // dd($command);

        $discordProcess = Process::fromShellCommandline($command);

        $discordProcess->run(function ($type, $buffer) {
            echo $buffer;
        });

        if (!$discordProcess->isSuccessful()) {
            throw new ProcessFailedException($discordProcess);
        }

        $this->info('Export completed successfully.');
        return 0;
    }
}
