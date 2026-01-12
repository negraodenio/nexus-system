
# Script to resize icons using .NET drawing or simple copy if tools missing
# Since we don't have ffmpeg/imagemagick guaranteed, we'll try to use PowerShell's System.Drawing
# If that fails, we'll just copy the 512x512 to other names (browsers will resize, but optimal to have sizes)

Add-Type -AssemblyName System.Drawing

$sourcePath = "c:\Users\denio\Documents\Denio\3d\public\icons\icon-512x512.png"
$sizes = @(72, 96, 128, 144, 152, 192, 384)

foreach ($size in $sizes) {
    $destPath = "c:\Users\denio\Documents\Denio\3d\public\icons\icon-${size}x${size}.png"
    
    try {
        $srcImage = [System.Drawing.Image]::FromFile($sourcePath)
        $newImage = new-object System.Drawing.Bitmap $size, $size
        $graphics = [System.Drawing.Graphics]::FromImage($newImage)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.DrawImage($srcImage, 0, 0, $size, $size)
        $newImage.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $graphics.Dispose()
        $newImage.Dispose()
        $srcImage.Dispose()
        Write-Host "Created $destPath"
    } catch {
        Write-Host "Failed to resize, copying original: $_"
        Copy-Item $sourcePath $destPath
    }
}
