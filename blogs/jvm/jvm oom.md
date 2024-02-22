# 【jvm详解】内存溢出问题排查过程
使用`Eclipse Memory Analyzer Tool`（MAT）工具来排查内存溢出问题，这个工具需要在其安装目录下的 MemoryAnalyzer.ini 文件中修改-Xmx的值来调整 MAT 工具的内存大小，调整为比dump文件的大小（正常的dump文件大小与内存溢出的应用的内存上限差不多）再大一点点，否则可能会导致dump文件打开报错。

打开该工具，点击`File -＞Open Heap Dump-＞Overview-＞Reports-＞Leak Suspects`就可以显示内存泄露疑点的描述，这些描述就可以帮助我们很快定位到内存溢出问题的原因。