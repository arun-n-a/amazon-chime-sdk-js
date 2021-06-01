// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  CanvasVideoFrameBuffer,
  VideoFrameBuffer,
  VideoFrameProcessor,
} from 'amazon-chime-sdk-js';
/**
 * [[CircularCut]] is an implementation of {@link VideoFrameProcessor} for demonstration purpose.
 * It updates the first {@link VideoFrameBuffer} from the input array and clip the whole frame to a circle.
 */
export default class CircularCut implements VideoFrameProcessor {
  private targetCanvas: HTMLCanvasElement = document.createElement('canvas') as HTMLCanvasElement;
  private targetCanvasCtx: CanvasRenderingContext2D = this.targetCanvas.getContext(
    '2d'
  ) as CanvasRenderingContext2D;
  private canvasVideoFrameBuffer = new CanvasVideoFrameBuffer(this.targetCanvas);
  private sourceWidth: number = 0;
  private sourceHeight: number = 0;
  constructor(private radius: number = 150) {}
  destroy(): Promise<void> {
    this.targetCanvasCtx = null;
    this.targetCanvas = null;
    this.canvasVideoFrameBuffer.destroy();
    return;
  }

  process(buffers: VideoFrameBuffer[]): Promise<VideoFrameBuffer[]> {
    // assuming one video stream
    console.log("******Circularcuts***");
    // console.log("******Circularcuts*** buffers: ", buffers);
    // console.log("******Circularcuts*** buffers index zero: ", buffers[0]);
    // console.log("******Circularcuts*** canvas element: ", buffers[0].asCanvasElement());
    const canvas = buffers[0].asCanvasElement();
    // console.log("*****Circular cut canvas****: ", canvas);
    const frameWidth = canvas.width;
    const frameHeight = canvas.height;
    console.log("****circular cut frameWidth is ", frameWidth);
    console.log("****circular cut frameHeight is ", frameHeight);
    console.log("***circular cut this.sourceWidth", this.sourceWidth);
    console.log("***circular cut this.sourceWidth", this.sourceHeight);
    if (frameWidth === 0 || frameHeight === 0) {
      console.log("***promise resolve buffers******");
      console.log("***promise resolve buffers", buffers);
      return Promise.resolve(buffers);
    }
    if (this.sourceWidth !== frameWidth || this.sourceHeight !== frameHeight) {
      console.log("****circularcut second if condition")
      this.sourceWidth = frameWidth;
      this.sourceHeight = frameHeight;

      // update target canvas size to match the frame size
      this.targetCanvas.width = this.sourceWidth;
      this.targetCanvas.height = this.sourceHeight;

      this.targetCanvasCtx.beginPath();
      // circle in the center
      this.targetCanvasCtx.arc(
        this.sourceWidth / 2,
        this.sourceHeight / 2,
        this.radius,
        0,
        2 * Math.PI
      );
      this.targetCanvasCtx.clip();
      this.targetCanvasCtx.stroke();
      this.targetCanvasCtx.closePath();
    }

    this.targetCanvasCtx.drawImage(canvas, 0, 0);
    console.log("****Draw Image******");
    var frameData = this.targetCanvasCtx.getImageData(0, 0, this.sourceWidth, this.sourceHeight);
    console.log("****var frames***");
    console.log("*** frameData is ****", frameData);
    buffers[0] = this.canvasVideoFrameBuffer;
    console.log("****Final buffers 0****", buffers[0]);
    console.log("****Frame data is: ", frameData.data);

    // console.log("*****this.canvasVideoFrameBuffer*****: ", buffers[0]);
    return Promise.resolve(buffers);
  }
}
