import {expect} from "chai";
import "mocha";
import * as execa from 'execa'
import * as nconf from "nconf";
import * as fs from 'fs-extra';
import {Provider} from "nconf";

const dirTree = require("directory-tree");
const testingKeys: Provider = nconf.env().file({file: __dirname + "/../config/testing_keys.json"});

describe("Templates command", () => {
    const serverToken: string = testingKeys.get("SERVER_TOKEN");
    const options: execa.CommonOptions = {env: {'POSTMARK_SERVER_TOKEN': serverToken}};
    const CLICommand: string = './dist/index.js';
    const pullFolder: string = './test/data';
    const commandParameters: string[] = ['templates', 'pull', pullFolder];

    afterEach(() => {
        fs.removeSync(pullFolder);
    });


    describe("Pull", () => {
        it('console out', async () => {
            const {stdout} = await execa(CLICommand, commandParameters, options);
            expect(stdout).to.include('All done');
        });

        describe("Folder", () => {
            it('templates', async () => {
                await execa(CLICommand, commandParameters, options);
                const templateFolders = dirTree(pullFolder);
                expect(templateFolders.children.length).to.be.gt(0);
            });

            it('single template - file names', async () => {
                await execa(CLICommand, commandParameters, options);
                const templateFolders = dirTree(pullFolder);

                const files = templateFolders.children[0].children;
                const names: string[] = files.map((f: any) => {
                    return f.name;
                });

                expect(names).to.members(['content.txt', 'content.html', 'meta.json']);
            });

            it('single template files - not zero size', async () => {
                await execa(CLICommand, commandParameters, options);
                const templateFolders = dirTree(pullFolder);

                const files = templateFolders.children[0].children;
                const sizes: string[] = files.map((f: any) => { return f.size; });

                let result = files.findIndex( (f:any) => { return f.size <= 0})
                expect(result).to.eq(-1);
            });
        });
    });
});
