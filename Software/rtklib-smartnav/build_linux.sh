$GYP_PATH smartnav.gyp --depth=. -f make --no-duplicate-basename-check --generator-output=./build.linux/

make -C ./build.linux/ V=1 -j 5