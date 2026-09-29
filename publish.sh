cd "$(dirname "$0")" || exit 1
gitfolio update
rsync -a dist/ ../groovyrae-portfolio/
cd ../groovyrae-portfolio
git add .
git commit -m "update site"
git push