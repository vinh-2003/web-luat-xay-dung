def parse_properties(text: str, doc_data: dict):
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    # default mappings
    prop_map = {
        "Số hiệu": "document_number",
        "Loại văn bản": "document_type",
        "Ngày ban hành": "issue_date",
        "Ngày có hiệu lực": "effective_date",
        "Tình trạng hiệu lực": "status",
        "Cơ quan ban hành": "issuing_body",
        "Người ký": "signer"
    }
    
    for i, line in enumerate(lines):
        for prop_vn, prop_en in prop_map.items():
            if line.lower() == prop_vn.lower() and i + 1 < len(lines):
                val = lines[i+1]
                if val != "--":
                    doc_data[prop_en] = val

sample = """
Luật sửa đổi, bổ sung một số điều của Luật Xây dựng số 62/2020/QH14
Số hiệu
62/2020/QH14
Loại văn bản
Luật
Ngành
--
Ngày ban hành
17/06/2020
Lĩnh vực
Chưa phân loại
Ngày có hiệu lực
01/01/2021
Tình trạng hiệu lực
Còn hiệu lực
Ngày hết hiệu lực
--
Cơ quan ban hành
Quốc hội
Chức danh
Chủ tịch Quốc hội
Người ký
Nguyễn Thị Kim Ngân
"""
doc = {}
parse_properties(sample, doc)
print(doc)
