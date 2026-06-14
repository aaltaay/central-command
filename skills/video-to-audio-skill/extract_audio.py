import argparse
import sys
import os
from moviepy import VideoFileClip

def extract_audio(video_path: str, output_path: str = None):
    """
    Extracts the audio track from a video and saves it to a file.
    By default, saves to the same directory as the video with an .mp3 extension.
    """
    if not os.path.isfile(video_path):
        print(f"Error: The video file '{video_path}' does not exist.")
        sys.exit(1)

    if not output_path:
        base, _ = os.path.splitext(video_path)
        output_path = f"{base}.mp3"
        
    print(f"Extracting audio from '{video_path}' -> '{output_path}'...")
    try:
        video = VideoFileClip(video_path)
        # Check if video has an audio track
        if video.audio is None:
            print("Error: The video does not contain an audio track.")
            sys.exit(1)
        
        # Write out the audio file
        video.audio.write_audiofile(output_path, logger=None)
        
        video.close()
        print(f"Successfully extracted audio to '{output_path}'")
    except Exception as e:
        print(f"An error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert video files into just audio (mp3 by default).")
    parser.add_argument("video_path", help="Path to the input video file")
    parser.add_argument("-o", "--output", help="Optional path for the output audio file (defaults to same name but .mp3)")
    args = parser.parse_args()

    extract_audio(args.video_path, args.output)
