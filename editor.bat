@ECHO OFF
WHERE RAN
IF %ERRORLEVEL% NEQ 0 GOTO :NORAN

SET "PWD=%~dp0"
SET "PWD=%PWD:~0,-1%"
START "editor" /D "%PWD%" /MIN /NEWWINDOW ran -r="%PWD%" -b=127.0.0.1 -p=8080 -i index.html -l=false -sa=false -g=false -nc=true -cors=true
GOTO :SUCCESS

:NORAN
ECHO Missing ran, download at https://github.com/m3ng9i/ran

:ERROR
EXIT /B 1
GOTO :END

:SUCCESS
EXIT /B 0

:END
