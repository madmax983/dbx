const path = require('path');
const fse = require('fs-extra');
const fs = require('fs');
const os = require('os');

function updateContent(content, varName, varValue) {
  content = content.replace(new RegExp(`{{${varName}}}`,'g'), varValue);
  return content;
}

function getContentType(ext){
  var extTypes = { 
    "3gp"   : "video/3gpp"
    , "a"     : "application/octet-stream"
    , "ai"    : "application/postscript"
    , "aif"   : "audio/x-aiff"
    , "aiff"  : "audio/x-aiff"
    , "asc"   : "application/pgp-signature"
    , "asf"   : "video/x-ms-asf"
    , "asm"   : "text/x-asm"
    , "asx"   : "video/x-ms-asf"
    , "atom"  : "application/atom+xml"
    , "au"    : "audio/basic"
    , "avi"   : "video/x-msvideo"
    , "bat"   : "application/x-msdownload"
    , "bin"   : "application/octet-stream"
    , "bmp"   : "image/bmp"
    , "bz2"   : "application/x-bzip2"
    , "c"     : "text/x-c"
    , "cab"   : "application/vnd.ms-cab-compressed"
    , "cc"    : "text/x-c"
    , "chm"   : "application/vnd.ms-htmlhelp"
    , "class"   : "application/octet-stream"
    , "com"   : "application/x-msdownload"
    , "conf"  : "text/plain"
    , "cpp"   : "text/x-c"
    , "crt"   : "application/x-x509-ca-cert"
    , "css"   : "text/css"
    , "csv"   : "text/csv"
    , "cxx"   : "text/x-c"
    , "deb"   : "application/x-debian-package"
    , "der"   : "application/x-x509-ca-cert"
    , "diff"  : "text/x-diff"
    , "djv"   : "image/vnd.djvu"
    , "djvu"  : "image/vnd.djvu"
    , "dll"   : "application/x-msdownload"
    , "dmg"   : "application/octet-stream"
    , "doc"   : "application/msword"
    , "dot"   : "application/msword"
    , "dtd"   : "application/xml-dtd"
    , "dvi"   : "application/x-dvi"
    , "ear"   : "application/java-archive"
    , "eml"   : "message/rfc822"
    , "eps"   : "application/postscript"
    , "exe"   : "application/x-msdownload"
    , "f"     : "text/x-fortran"
    , "f77"   : "text/x-fortran"
    , "f90"   : "text/x-fortran"
    , "flv"   : "video/x-flv"
    , "for"   : "text/x-fortran"
    , "gem"   : "application/octet-stream"
    , "gemspec" : "text/x-script.ruby"
    , "gif"   : "image/gif"
    , "gz"    : "application/x-gzip"
    , "h"     : "text/x-c"
    , "hh"    : "text/x-c"
    , "htm"   : "text/html"
    , "html"  : "text/html"
    , "ico"   : "image/vnd.microsoft.icon"
    , "ics"   : "text/calendar"
    , "ifb"   : "text/calendar"
    , "iso"   : "application/octet-stream"
    , "jar"   : "application/java-archive"
    , "java"  : "text/x-java-source"
    , "jnlp"  : "application/x-java-jnlp-file"
    , "jpeg"  : "image/jpeg"
    , "jpg"   : "image/jpeg"
    , "js"    : "application/javascript"
    , "json"  : "application/json"
    , "log"   : "text/plain"
    , "m3u"   : "audio/x-mpegurl"
    , "m4v"   : "video/mp4"
    , "man"   : "text/troff"
    , "mathml"  : "application/mathml+xml"
    , "mbox"  : "application/mbox"
    , "mdoc"  : "text/troff"
    , "me"    : "text/troff"
    , "mid"   : "audio/midi"
    , "midi"  : "audio/midi"
    , "mime"  : "message/rfc822"
    , "mml"   : "application/mathml+xml"
    , "mng"   : "video/x-mng"
    , "mov"   : "video/quicktime"
    , "mp3"   : "audio/mpeg"
    , "mp4"   : "video/mp4"
    , "mp4v"  : "video/mp4"
    , "mpeg"  : "video/mpeg"
    , "mpg"   : "video/mpeg"
    , "ms"    : "text/troff"
    , "msi"   : "application/x-msdownload"
    , "odp"   : "application/vnd.oasis.opendocument.presentation"
    , "ods"   : "application/vnd.oasis.opendocument.spreadsheet"
    , "odt"   : "application/vnd.oasis.opendocument.text"
    , "ogg"   : "application/ogg"
    , "p"     : "text/x-pascal"
    , "pas"   : "text/x-pascal"
    , "pbm"   : "image/x-portable-bitmap"
    , "pdf"   : "application/pdf"
    , "pem"   : "application/x-x509-ca-cert"
    , "pgm"   : "image/x-portable-graymap"
    , "pgp"   : "application/pgp-encrypted"
    , "pkg"   : "application/octet-stream"
    , "pl"    : "text/x-script.perl"
    , "pm"    : "text/x-script.perl-module"
    , "png"   : "image/png"
    , "pnm"   : "image/x-portable-anymap"
    , "ppm"   : "image/x-portable-pixmap"
    , "pps"   : "application/vnd.ms-powerpoint"
    , "ppt"   : "application/vnd.ms-powerpoint"
    , "ps"    : "application/postscript"
    , "psd"   : "image/vnd.adobe.photoshop"
    , "py"    : "text/x-script.python"
    , "qt"    : "video/quicktime"
    , "ra"    : "audio/x-pn-realaudio"
    , "rake"  : "text/x-script.ruby"
    , "ram"   : "audio/x-pn-realaudio"
    , "rar"   : "application/x-rar-compressed"
    , "rb"    : "text/x-script.ruby"
    , "rdf"   : "application/rdf+xml"
    , "roff"  : "text/troff"
    , "rpm"   : "application/x-redhat-package-manager"
    , "rss"   : "application/rss+xml"
    , "rtf"   : "application/rtf"
    , "ru"    : "text/x-script.ruby"
    , "s"     : "text/x-asm"
    , "sgm"   : "text/sgml"
    , "sgml"  : "text/sgml"
    , "sh"    : "application/x-sh"
    , "sig"   : "application/pgp-signature"
    , "snd"   : "audio/basic"
    , "so"    : "application/octet-stream"
    , "svg"   : "image/svg+xml"
    , "svgz"  : "image/svg+xml"
    , "swf"   : "application/x-shockwave-flash"
    , "t"     : "text/troff"
    , "tar"   : "application/x-tar"
    , "tbz"   : "application/x-bzip-compressed-tar"
    , "tcl"   : "application/x-tcl"
    , "tex"   : "application/x-tex"
    , "texi"  : "application/x-texinfo"
    , "texinfo" : "application/x-texinfo"
    , "text"  : "text/plain"
    , "tif"   : "image/tiff"
    , "tiff"  : "image/tiff"
    , "torrent" : "application/x-bittorrent"
    , "tr"    : "text/troff"
    , "txt"   : "text/plain"
    , "vcf"   : "text/x-vcard"
    , "vcs"   : "text/x-vcalendar"
    , "vrml"  : "model/vrml"
    , "war"   : "application/java-archive"
    , "wav"   : "audio/x-wav"
    , "wma"   : "audio/x-ms-wma"
    , "wmv"   : "video/x-ms-wmv"
    , "wmx"   : "video/x-ms-wmx"
    , "wrl"   : "model/vrml"
    , "wsdl"  : "application/wsdl+xml"
    , "xbm"   : "image/x-xbitmap"
    , "xhtml"   : "application/xhtml+xml"
    , "xls"   : "application/vnd.ms-excel"
    , "xml"   : "application/xml"
    , "xpm"   : "image/x-xpixmap"
    , "xsl"   : "application/xml"
    , "xslt"  : "application/xslt+xml"
    , "yaml"  : "text/yaml"
    , "yml"   : "text/yaml"
    , "zip"   : "application/zip"
  };
  return extTypes[ext];
}

(function () {
  'use strict';

  module.exports = {
    topic: 'config',
    command: 'static',
    description: 'Create static resource',
    help: 'help text for dbx:static:create',
    flags: [{
      name: 'orgname',
      char: 'u',
      description: 'name of scratch org',
      hasValue: true,
      required: false
  },{
      name: 'name',
      char: 'n',
      description: 'static resource name',
      hasValue: true,
      required: true
    },{
      name: 'description',
      char: 'd',
      description: 'description',
      hasValue: true,
      required: true
    },{
      name: 'file',
      char: 'f',
      description: 'path of the file to create',
      hasValue: true,
      required: true
    },{
      name: 'cachecontrol',
      char: 'c',
      description: 'public or private static resource',
      default: 'Public',
      hasValue: true,
      required: false
    }, {
        name: 'push',
        description: 'push to scratch org',
        hasValue: false

    }],
    run(context) {
      const orgname = context.flags.orgname;
      const name = context.flags.name;
      let file = context.flags.file;
      let description = context.flags.description;

      if (file.endsWith('/')){
        file = file.substring(0,file.length() - 1 );
      }
      var ext = path.extname(file).substring(1); 
      var staticpath = `./force-app/main/default/staticresources`;
      if (!fs.existsSync(staticpath)){
        fs.mkdirSync(staticpath);
      }
      var cachecontrol = 'Public';
      var contenttype = getContentType(ext);

      if (!contenttype){
        console.error("Content-type not supported.");
        process.exit(0);
      }

      const filesCreated = [];
      //meta
      let template = path.join(__dirname,'.', 'template-meta.xml');
      let content = fs.readFileSync(template).toString();
      content = updateContent(content, 'description',description);
      content = updateContent(content, 'content_type',contenttype);
      content = updateContent(content, 'cache_control',cachecontrol);

      var outmetapath = `${staticpath}/${name}.resource-meta.xml`;
      fse.ensureDirSync(staticpath);
      fs.writeFileSync(outmetapath, content);
      filesCreated.push(outmetapath);

      //file
      var outfilepath = `${staticpath}/${name}.${ext}`;
      fse.copySync(file, outfilepath);
      filesCreated.push(outfilepath);

      let result = 'The following files were created:';
      for (let i = 0; i < filesCreated.length; i++) {
        result += `\n  ${filesCreated[i]}`;
      }
    
      console.log(result);

      if (context.flags.push){
          console.log('Push source to org...');
          try {
              if (orgname)
                  console.log(require('child_process').execSync(`sfdx force:source:push -g -f -u ${orgname} > output.txt`).toString());
              else 
                  console.log(require('child_process').execSync(`sfdx force:source:push -g -f > output.txt`).toString());
          } catch (err) {}
          var output = fs.readFileSync('./output.txt');
          console.log(output.toString());
          fs.unlinkSync('./output.txt');
      }
    }
  };
}());