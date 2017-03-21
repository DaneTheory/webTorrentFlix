sudo rm -rf JuanFlix.dmg &&
sudo rm -rf juanFlix-darwin-x64 &&
electron-packager ./ juanFlix &&
electron-installer-dmg ./juanFlix-darwin-x64/juanFlix.app  JuanFlix 
