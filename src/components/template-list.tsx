import { Modal, Table } from 'antd'
import type { TableColumnsType } from 'antd';

interface DataType {
  key: React.Key;
  name: string;
  type: string;
  content: string;
}

export default function TemplateList({ templateListOpen, setTemplateListOpen }) {
  const fileContent = "Hello World"
  // const blob = new Blob([fileContent], { type: 'text/plain' });

  const columns : TableColumnsType<DataType> = [
    {
      title: 'File Name',
      dataIndex: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
    },
    {
      title: 'Operation',
      dataIndex: 'content',
      render: (text: string, record: DataType) => <a onClick={() => downloadFile(record.name, text)}>Download</a>,
    },
  ]

  const data = [
    {
      key: '1',
      name: 'pd1.h',
      type: 'C Header File',
      content: 'content',
    },
    {
      key: '2',
      name: 'pd2.h',
      type: 'C Header File',
      content: 'content',
    },
    {
      key: '3',
      name: 'pd3.h',
      type: 'C Header File',
      content: 'content',
    },
  ]

  const downloadFile = async (filename, content) => {
    // Create a writable stream to the user's filesystem
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: filename
      });
  
      const writableStream = await fileHandle.createWritable();
      await writableStream.write(content);
      await writableStream.close();
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <Modal
      title="Template Files"
      centered
      forceRender
      open={templateListOpen}
      onOk={() => setTemplateListOpen(false)}
      onCancel={() => setTemplateListOpen(false)}
      width={1000}
    >
      <div>
      <Table
        columns={columns}
        dataSource={data}
      />
      </div>
    </Modal>
  )
}
