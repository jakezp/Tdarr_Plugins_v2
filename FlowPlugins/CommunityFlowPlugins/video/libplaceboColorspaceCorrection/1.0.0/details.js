"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var details = function () { return ({
    name: 'Libplacebo Colorspace Correction',
    description: "This plugin uses libplacebo to convert HDR (Dolby Vision content) to SDR.\n  It applies appropriate colorspace transformations based on the input parameters (only been tested on DV Profile 5).\n  Will update the plugin as further testing is done.\n  \n  Features:\n  - Fixes colorspace issues in HDR and Dolby Vision content\n  - Applies tonemapping for proper display on SDR devices\n  - Configurable parameters for colorspace, primaries, and transfer characteristics\n  - Optional Dolby Vision processing\n  - Adjustable contrast recovery and tonemapping settings",
    style: {
        borderColor: 'orange',
    },
    tags: 'video,hdr,dolby vision,dovi,colorspace,tonemapping,libplacebo,ffmpeg',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '',
    inputs: [
        {
            label: 'Colorspace',
            name: 'colorspace',
            type: 'string',
            defaultValue: 'bt709',
            inputUI: {
                type: 'dropdown',
                options: [
                    'bt709',
                    'bt2020',
                    'bt601',
                    'bt601-525',
                    'bt601-625',
                ],
            },
            tooltip: 'Target colorspace for the output video',
        },
        {
            label: 'Color Primaries',
            name: 'colorPrimaries',
            type: 'string',
            defaultValue: 'bt709',
            inputUI: {
                type: 'dropdown',
                options: [
                    'bt709',
                    'bt2020',
                    'bt601',
                    'bt601-525',
                    'bt601-625',
                ],
            },
            tooltip: 'Target color primaries for the output video',
        },
        {
            label: 'Color Transfer Characteristics',
            name: 'colorTrc',
            type: 'string',
            defaultValue: 'bt709',
            inputUI: {
                type: 'dropdown',
                options: [
                    'bt709',
                    'bt2020-10',
                    'bt2020-12',
                    'srgb',
                    'gamma22',
                    'gamma28',
                    'pq',
                    'hlg',
                ],
            },
            tooltip: 'Target transfer characteristics for the output video',
        },
        {
            label: 'Tonemapping Algorithm',
            name: 'tonemapping',
            type: 'string',
            defaultValue: '4',
            inputUI: {
                type: 'dropdown',
                options: [
                    '0',
                    '1',
                    '2',
                    '3',
                    '4',
                    '5',
                    '6', // Linear
                ],
            },
            tooltip: '0=None, 1=Clip, 2=Mobius, 3=Reinhard, 4=Hable, 5=Gamma, 6=Linear',
        },
        {
            label: 'Apply Dolby Vision',
            name: 'applyDolbyVision',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'dropdown',
                options: [
                    'true',
                    'false',
                ],
            },
            tooltip: 'Whether to apply Dolby Vision processing',
        },
        {
            label: 'Gamut Mode',
            name: 'gamutMode',
            type: 'string',
            defaultValue: '1',
            inputUI: {
                type: 'dropdown',
                options: [
                    '0',
                    '1',
                    '2',
                    '3', // Absolute
                ],
            },
            tooltip: '0=Perceptual, 1=Relative, 2=Saturation, 3=Absolute',
        },
        {
            label: 'Contrast Recovery',
            name: 'contrastRecovery',
            type: 'string',
            defaultValue: '0.6',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Contrast recovery value (0.0-1.0)',
        },
        {
            label: 'Tonemapping LUT Size',
            name: 'tonemappingLutSize',
            type: 'string',
            defaultValue: '256',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Size of the tonemapping lookup table',
        },
        {
            label: 'Video Codec',
            name: 'videoCodec',
            type: 'string',
            defaultValue: 'hevc_nvenc',
            inputUI: {
                type: 'dropdown',
                options: [
                    'hevc_nvenc',
                    'h264_nvenc',
                    'libx265',
                    'libx264',
                ],
            },
            tooltip: 'Video codec to use for encoding',
        },
        {
            label: 'Encoding Preset',
            name: 'encodingPreset',
            type: 'string',
            defaultValue: 'p4',
            inputUI: {
                type: 'dropdown',
                options: [
                    'p1',
                    'p2',
                    'p3',
                    'p4',
                    'p5',
                    'p6',
                    'p7', // Fastest, worst quality
                ],
            },
            tooltip: 'Encoding preset (p1=slowest/best quality, p7=fastest/worst quality)',
        },
        {
            label: 'CQ/CRF Value',
            name: 'cqValue',
            type: 'string',
            defaultValue: '18',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Constant quality value (lower = better quality)',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Continue to next plugin',
        },
    ],
}); };
exports.default = details;
