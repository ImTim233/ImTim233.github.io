(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const storageKey = 'loshu-vokabeln-v1';
  const fields = ['es', 'de', 'zh', 'lesson', 'example'];
  let local = [], published = [], undo = null, editing = null;
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().replace(/ß/g, 'ss');
  const identity = word => JSON.stringify(fields.map(key => String(word[key] || '').trim()));
  function validate(data) {
    if (!Array.isArray(data) || data.length > 10000) throw new Error('备份必须是词条数组，最多 10000 条。');
    return data.map(word => {
      if (!word || typeof word !== 'object' || ['es', 'de', 'zh'].some(key => typeof word[key] !== 'string' || !word[key].trim())) throw new Error('每条生词都需要西班牙语、德语和中文。');
      const clean = {};
      for (const key of fields) {
        if (word[key] != null && typeof word[key] !== 'string') throw new Error('词条字段必须是文字。');
        clean[key] = (word[key] || '').trim();
        if (clean[key].length > (key === 'example' ? 1000 : 200)) throw new Error('词条内容过长。');
      }
      return clean;
    });
  }
  function message(text) { $('message').textContent = text; }
  function resetEditor() {
    editing = null;
    $('add-word').reset();
    $('save-word').textContent = '添加生词';
    $('editor-title').textContent = '添加生词';
    $('cancel-edit').hidden = true;
  }
  function save(next) {
    if (next.length > 10000) { message('最多保存 10000 条生词，请先导出备份并整理词库。'); return false; }
    try { localStorage.setItem(storageKey, JSON.stringify(next)); local = next; render(); return true; }
    catch { message('无法保存到浏览器，请检查存储设置或空间。输入内容已保留。'); return false; }
  }
  function allWords() {
    const unique = new Map();
    for (const word of published) unique.set(identity(word), { ...word, source: 'published' });
    for (const word of local) if (!unique.has(identity(word))) unique.set(identity(word), { ...word, source: 'local' });
    return [...unique.values()].sort((a, b) => a.es.localeCompare(b.es, 'es'));
  }
  function render() {
    const words = allWords(), terms = normalize($('search').value).trim().split(/\s+/).filter(Boolean);
    const matches = words.filter(word => terms.every(term => normalize(fields.map(key => word[key]).join(' ')).includes(term)));
    $('rows').replaceChildren();
    for (const word of matches) {
      const row = document.createElement('tr');
      for (const key of ['es', 'de', 'zh']) {
        const cell = document.createElement('td'); cell.textContent = word[key];
        if (key === 'es') for (const detail of [word.lesson, word.example]) if (detail) { const note = document.createElement('small'); note.textContent = detail; cell.append(note); }
        row.append(cell);
      }
      const action = document.createElement('td');
      if (word.source === 'local') {
        const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'delete'; edit.textContent = '修改'; edit.setAttribute('aria-label', `修改 ${word.es}`);
        edit.addEventListener('click', () => {
          editing = identity(word);
          for (const key of fields) $(key).value = word[key] || '';
          $('word-editor').open = true;
          $('save-word').textContent = '保存修改';
          $('editor-title').textContent = '修改生词';
          $('cancel-edit').hidden = false;
          message(`正在修改 ${word.es}。`); $('es').focus();
        });
        action.append(edit, ' ');
        const button = document.createElement('button'); button.type = 'button'; button.className = 'delete'; button.textContent = '删除'; button.setAttribute('aria-label', `删除 ${word.es}`);
        button.addEventListener('click', () => {
          const previous = [...local];
          if (save(local.filter(item => identity(item) !== identity(word)))) {
            if (editing === identity(word)) resetEditor();
            undo = previous; message(`已删除 ${word.es}。`);
            const restore = document.createElement('button'); restore.type = 'button'; restore.textContent = '撤销';
            restore.addEventListener('click', () => { if (undo && save(undo)) { undo = null; message('已恢复词条。'); } });
            $('message').append(' ', restore);
          }
        }); action.append(button);
      } else action.textContent = '已发布';
      row.append(action); $('rows').append(row);
    }
    $('count').textContent = terms.length ? `找到 ${matches.length} / ${words.length} 个词条` : `共 ${words.length} 个词条`;
    $('empty').hidden = matches.length > 0;
    $('empty').textContent = words.length ? '没有找到匹配的词条。' : '还没有生词，在上方添加第一个吧。';
  }
  try { const stored = localStorage.getItem(storageKey); local = stored ? validate(JSON.parse(stored)) : []; }
  catch { message('浏览器中的备份暂时无法读取，原有存储未被覆盖。请先导出原始备份后再添加。'); $('add-word').querySelector('button').disabled = true; $('import').disabled = true; }
  $('add-word').addEventListener('submit', event => {
    event.preventDefault();
    let word;
    try { word = validate([Object.fromEntries(fields.map(key => [key, $(key).value]))])[0]; }
    catch (error) { message(error.message); return; }
    if (editing && !local.some(item => identity(item) === editing)) { message('原词条已不存在，请取消修改后重新添加。'); return; }
    if (allWords().some(item => identity(item) === identity(word) && identity(item) !== editing)) { message('这个词条已经在生词本里了，请修改内容后再保存。'); return; }
    const wasEditing = editing !== null;
    const next = wasEditing ? local.map(item => identity(item) === editing ? word : item) : [...local, word];
    if (save(next)) { resetEditor(); $('search').value = ''; render(); message(`已${wasEditing ? '修改' : '添加'} ${word.es}，保存在此浏览器。`); $('es').focus(); }
  });
  $('cancel-edit').addEventListener('click', () => { resetEditor(); message('已取消修改，原词条保持不变。'); });
  $('search').addEventListener('input', render);
  $('export').addEventListener('click', () => {
    const text = $('add-word').querySelector('button').disabled ? (localStorage.getItem(storageKey) || '[]') : JSON.stringify(allWords().map(word => Object.fromEntries(fields.map(key => [key, word[key] || '']))), null, 2);
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `vokabeln-${new Date().toISOString().slice(0, 10)}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    message('已导出备份，请保管好下载的 JSON 文件。');
  });
  $('import').addEventListener('change', async event => {
    const file = event.target.files[0]; if (!file) return;
    try {
      if (file.size > 10000000) throw new Error('备份文件不能超过 10 MB。');
      const incoming = validate(JSON.parse(await file.text())), seen = new Set(allWords().map(identity));
      const additions = incoming.filter(word => { const id = identity(word); if (seen.has(id)) return false; seen.add(id); return true; });
      if (save([...local, ...additions])) message(`已导入 ${additions.length} 条，跳过 ${incoming.length - additions.length} 条重复词条。`);
    } catch (error) { message(`导入失败：${error instanceof SyntaxError ? '文件不是有效的 JSON。' : error.message}`); }
    event.target.value = '';
  });
  render();
  fetch('/vokabeln/words.json').then(response => { if (!response.ok) throw new Error(); return response.json(); }).then(data => { published = validate(data); render(); }).catch(() => message('已发布词库暂时无法加载；本地添加与搜索仍可使用。'));
})();
