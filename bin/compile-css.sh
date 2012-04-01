#TODO: Ultimately should probably switch to something natively supported by epxress (so SASS or LESS)
command -v sass > /dev/null 2>&1 || {
  echo Must have sass installed
  exit 1
}

dir=`dirname $0`
scssPath="${dir}/../public/stylesheets/scss"

cd $scssPath
cssPath="../compiled"

echo Removing existing stylesheets
rm -f ${cssPath}/*.css

for scss in `ls *.scss`; do
  css=${cssPath}/${scss/.scss/.css}
  echo Compiling $scss to $css
  sass $scss $css
done
