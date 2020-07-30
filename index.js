const { CanvasRenderService } = require("chartjs-node-canvas");
const yargs = require("yargs");

const argv = yargs
  .option("width", {
    alias: "w",
    description: "Image width",
    type: "number",
  })
  .option("height", {
    alias: "h",
    description: "Image height",
    type: "number",
  })
  .option("type", {
    alias: "t",
    description: "Chart type",
    type: "string",
  })
  .option("data", {
    alias: "d",
    description: "Chart data ({labels:[],datasets:[]}",
    type: "json",
  })
  .option("output", {
    alias: "u",
    description: "File path to output png (if not specified, image binary will be send to stdout)",
    type: "string",
  })
  .option("options", {
    alias: "o",
    description: "Chart options",
    type: "json",
  })
  .help()
  .argv;

const fs = require("fs");
if (argv.data) {
  argv.data = JSON.parse(argv.data);
}
if (argv.options) {
  argv.options = JSON.parse(argv.options);
}
if (!argv.output) {
  argv.output = null;
}
const defaultConfigurations = {
  type: "bar",
  data: {},
  options: {},
};
const configuration = {
  type: "bar",
  data: argv.data ? argv.data : {},
  options: argv.options ? argv.options : {},
};
const width = argv.width ? argv.width : 400; //px
const height = argv.height ? argv.height : 400; //px
const canvasRenderService = new CanvasRenderService(width, height, (ChartJS) => {});

(async () => {
  if (argv.output) {
    await new Promise((resolve) => {
      const stream = canvasRenderService.renderToStream(configuration);
      const writeStream = fs
        .createWriteStream(argv.output)
        .once("error", (error) => {
          process.stdout.write(error.message);
          process.exit(error.errno);
        })
        .once("close", () => {
          resolve();
        });
      stream.pipe(writeStream);
    });
  } else {
    process.stdout.write(await canvasRenderService.renderToBuffer(configuration));
  }

  process.exit(0);
})();
