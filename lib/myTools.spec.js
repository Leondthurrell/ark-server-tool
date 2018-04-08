let myTools = require('./myTools.js');

describe('myTools', ()=>{
    describe('loadConf', ()=>{
        it('should throw "no valid config provided" if blank', ()=>{
            expect(()=>{
                myTools.loadConf();
            }).to.throw();
        });
        it('should return "File not found" if invalid path', ()=>{
            let file = '/not/a/real/file.ar';
            expect(()=>{
                myTools.loadConf(file);
            }).to.throw();
        });
        it('should return an object if valid JSON file provided', ()=>{
            let file = './config.json';
            let config = myTools.loadConf(file);
            expect(config).to.be.an('object');
        });
        it('should return an object if valid INI file provided', ()=>{
            let file = './test/configs/Game.ini';
            let config = myTools.loadConf(file);
            expect(config).to.be.an('object');
        });
        it('should return File not supported if file not a JSON or INI', ()=>{
            let file = './lib/myTools.js';
            expect(()=>{
                myTools.loadConf(file);
            }).to.throw();
        });
    });
    describe('getWorkshopDetails', ()=>{
        it('response body should be able to pe parsed into a JSON object containing the mod details', (done)=>{
            let list = [1139371102];
            myTools.getWorkshopDetails(list, (e, respone, body)=>{
                expect(JSON.parse(body)).to.be.an('object').and.to.have.key('response');
                done();
            });
        });
        it('should return details for all provided mods', (done)=>{
            let list = [1139371102, 749466101];
            myTools.getWorkshopDetails(list, (e, respone, body)=>{
                let parsed = JSON.parse(body);
                expect(parsed.response.publishedfiledetails.length).to.equal(list.length);
                done();
            });
        });
        it('should return an error if list is a not an array', ()=>{
            let list = '[1139371102, 749466101]';
            expect(()=>{
                myTools.getWorkshopDetails(list);
            }).to.throw();
        });
    });
});
