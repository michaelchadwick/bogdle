task :deploy do
  sh 'git push origin main'
  sh "rsync -auP --no-p --exclude-from='rsync-exclude.txt' . $BOGDLE_REMOTE"
end

task :update_words do
  sh "rsync -auP --no-p --include='/word*.txt' --exclude='*' --dry-run ./assets/text/ $BOGDLE_REMOTE"
end

task default: [:deploy]
