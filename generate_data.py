import os
import sys
import re
import json

'''
将blogs目录下所有md文件中的标题进行解析，注意blogs目录下只允许有且仅有一级目录。
主要解析出文章标题（title）、文章分类（tag）、对应的html文件路径（path）。
然后将解析出来的数据写入到scripts/data.js文件中。
每次执行当前脚本都会覆盖scripts/data.js文件中的所有内容。
'''

blogs = []
path = "./blogs"
dirs = os.listdir(path)
for dir in dirs:
    if os.path.isdir(path + "/" + dir):
        files = os.listdir(path + "/" + dir)
        for file in files:
            if(".md" in file):
                blogPath = path + "/" + dir + "/" + file
                blogFile = open(blogPath, "r", encoding='UTF-8')
                while True:
                    title = blogFile.readline()
                    if not title:
                        break
                    content = title + blogFile.read()
                    title = title.split("\n")[0]
                    searchObj = re.search("【.*】", title)
                    if(searchObj != None):
                        tag = searchObj.group(0)
                        blogPath = blogPath.replace(".md", ".js", 1)
                        blogJsFile = open(blogPath, "w", encoding='UTF-8')
                        blogJs = {
                            'content':content,
                            'title':title.replace("#", "", 10).strip()
                        }
                        blogJsStr = "\treturn blog = " + json.dumps(blogJs, ensure_ascii=False) + "\n"
                        jsSeq = ["function getBlog(){\n", blogJsStr, "}"]
                        blogJsFile.writelines(jsSeq)
                        blogJsFile.close()
                        blog = {
                            'tag':tag,
                            'title':title.replace("#", "", 10).strip(),
                            'path':blogPath
                        }
                        blogs.append("\n\t\t" + json.dumps(blog, ensure_ascii=False))
                        break
                blogFile.close()
blogsStr = "\treturn blogs = [" + ",".join(blogs) + "\n\t]\n"
dataFile = open("./scripts/data.js", "w", encoding='UTF-8')
seq = ["function getAllBlogs(){\n", blogsStr, "}"]
dataFile.writelines(seq)
dataFile.close()
