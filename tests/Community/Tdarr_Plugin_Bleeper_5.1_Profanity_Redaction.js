/* eslint max-len: 0 */
const _ = require('lodash');
const run = require('../helpers/run');

// Mock the profanityList module
jest.mock('../../utils/profanityList', () => ({
  isProfanity: jest.fn().mockReturnValue(false),
  profanityList: {
    mild: ['damn', 'hell'],
    medium: ['damn', 'hell', 'shit'],
    strong: ['damn', 'hell', 'shit', 'fuck'],
  },
}));

const tests = [
  {
    input: {
      file: _.cloneDeep(require('../sampleData/media/sample5.1Audio.json')),
      librarySettings: {},
      inputs: {
        whisperServiceEndpoint: 'http://192.168.1.250:9000',
        profanityFilterLevel: 'medium',
        keepOriginalAudio: true,
        generateSubtitles: true,
        beepFrequency: 1000,
      },
      otherArguments: {
        originalLibraryFile: '/path/to/sample/video.mkv',
      },
    },
    output: {
      processFile: false,
      preset: '',
      container: '.mp4',
      handBrakeMode: false,
      FFmpegMode: true,
      reQueueAfter: false,
      infoLog: '☑ File has 5.1 audio. Processing...\n'
               + '☑ WhisperX Service Endpoint: http://192.168.1.250:9000\n'
               + '☑ Profanity Filter Level: medium\n'
               + '☑ Keep Original Audio: true\n'
               + '☑ Generate Subtitles: true\n'
               + '☑ Beep Frequency: 1000 Hz\n',
    },
  },
  {
    input: {
      file: _.cloneDeep(require('../sampleData/media/sampleStereoAudio.json')),
      librarySettings: {},
      inputs: {
        whisperServiceEndpoint: 'http://192.168.1.250:9000',
        profanityFilterLevel: 'medium',
        keepOriginalAudio: true,
        generateSubtitles: true,
        beepFrequency: 1000,
      },
      otherArguments: {
        originalLibraryFile: '/path/to/sample/video.mkv',
      },
    },
    output: {
      processFile: false,
      preset: '',
      container: '.mp4',
      handBrakeMode: false,
      FFmpegMode: true,
      reQueueAfter: false,
      infoLog: '☒ File does not have 5.1 audio. Skipping.\n',
    },
  },
];

void run(tests);
