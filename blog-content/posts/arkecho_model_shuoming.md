# ArkEcho系列模型说明（持续更新）

ArkEcho系列目前提供适用于**RVC**与**GPT-SoVITS**的模型，需要用户自行安装RVC与GPT-SoVITS。

RVC与GPT-SoVITS软件的作者为**花儿不哭**，下载链接：
- RVC: https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI/releases
- GPT-SoVITS: https://github.com/RVC-Boss/GPT-SoVITS/releases

RVC模型使用：需要将模型文件拖动到对应文件夹，以我的RVC1006Nvidia举例

<img width="685" height="612" alt="image" src="https://github.com/user-attachments/assets/fa3183be-7210-4964-8f20-284ddabfef60" />

找到assets文件夹，然后再找到weights文件夹

<img width="724" height="249" alt="image" src="https://github.com/user-attachments/assets/d40838d1-8291-44c0-a6c2-c75f29b35ece" />

将 **.pth** 与 **.index** 文件拖动进去，然后就完成了模型的安装。

RVC变声器的使用可以在B站上搜索，还是比较简单的。

GPT-SoVITS模型使用：需要将模型文件拖动到对应文件夹，以我的GPT-SoVITS-v2pro-20250604举例

<img width="624" height="575" alt="image" src="https://github.com/user-attachments/assets/e30083d4-7848-4c08-be72-9facda3f50cb" />

这时我们需要注意模型的版本，通常GPT-SoVITS会自动识别版本，但是为了方便整理，还是找到对应版本的文件夹比较好，拿

<img width="895" height="120" alt="image" src="https://github.com/user-attachments/assets/39c6f1ea-9fb3-4049-bd0a-06b0d66d3dda" />

举例，观察文件名，如果包含GPTv2pro就将它放到GPT_weights_v2Pro文件夹里，其他同理

<img width="853" height="102" alt="image" src="https://github.com/user-attachments/assets/53b2b137-955c-4072-a081-751e8bec179d" />

<img width="709" height="593" alt="image" src="https://github.com/user-attachments/assets/7fd09f12-3613-484b-9934-d15efc22d22d" />

然后，我们需要准备参考音频，拿ArkEcho-GSV-Closure-Chinese-Full模型举例，右下角有一个

<img width="643" height="159" alt="image" src="https://github.com/user-attachments/assets/6c952838-d2f8-464c-b078-42f790678f7a" />

点进去，

<img width="1067" height="847" alt="image" src="https://github.com/user-attachments/assets/e71d3b0f-10b3-4a15-96d4-cc82254bdc9a" />

这里都是语音，选择一个时长在范围内的即可。

注意参考音频是音色和情绪的重要因素，因此需要按照需求选择特定的添加，而不是胡乱添加。

如果打不开HuggingFace，prts.wiki也有帮助：

https://prts.wiki/w/可露希尔/语音记录

这里面包含语音记录直接下载即可。

如果有自己想要的音频发现太长太短了，可以拖动到音频处理软件，这里不多赘述。

## Q/A

- Q: ArkEcho收费吗
  - 绝对不收费，永久免费
- Q: RVC与So-VITS模型通用吗
  - 不通用
- Q: 我还有问题怎么办
  - 私信我QQ3110197220或在https://github.com/dhjs0000/dhjs0000.github.io/issues提出
  
