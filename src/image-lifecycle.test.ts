import { describe, expect, it, vi } from 'vite-plus/test';
import { resolveImageChange, writeWithImage } from './image-lifecycle';

describe('resolveImageChange', () => {
  it('keeps the picture when nothing about it changed', () => {
    expect(resolveImageChange({ uploaded: null, removeRequested: false, current: 'w/1/a.jpg' })).toEqual({
      imageKey: 'w/1/a.jpg',
      discard: null,
    });
  });

  it('replaces the picture and discards the old one', () => {
    expect(resolveImageChange({ uploaded: 'w/1/b.jpg', removeRequested: false, current: 'w/1/a.jpg' })).toEqual({
      imageKey: 'w/1/b.jpg',
      discard: 'w/1/a.jpg',
    });
  });

  it('removes the picture when asked, and discards it', () => {
    expect(resolveImageChange({ uploaded: null, removeRequested: true, current: 'w/1/a.jpg' })).toEqual({
      imageKey: null,
      discard: 'w/1/a.jpg',
    });
  });

  it('lets a new upload win over a remove request', () => {
    expect(resolveImageChange({ uploaded: 'w/1/b.jpg', removeRequested: true, current: 'w/1/a.jpg' })).toEqual({
      imageKey: 'w/1/b.jpg',
      discard: 'w/1/a.jpg',
    });
  });

  it('has nothing to discard when there was no picture', () => {
    expect(resolveImageChange({ uploaded: 'w/1/b.jpg', removeRequested: false, current: null }).discard).toBeNull();
    expect(resolveImageChange({ uploaded: null, removeRequested: true, current: null })).toEqual({
      imageKey: null,
      discard: null,
    });
  });
});

describe('writeWithImage', () => {
  it('leaves the picture alone when the write succeeds', async () => {
    const remove = vi.fn(async () => undefined);
    expect(await writeWithImage('w/1/a.jpg', async () => 'saved', remove)).toBe('saved');
    expect(remove).not.toHaveBeenCalled();
  });

  it('removes the freshly stored picture when the write fails, and passes the error on', async () => {
    const remove = vi.fn(async () => undefined);
    const failure = new Error('database is down');
    await expect(writeWithImage('w/1/a.jpg', async () => Promise.reject(failure), remove)).rejects.toBe(failure);
    expect(remove).toHaveBeenCalledWith('w/1/a.jpg');
  });

  it('does not try to remove anything when no picture was stored', async () => {
    const remove = vi.fn(async () => undefined);
    await expect(writeWithImage(null, async () => Promise.reject(new Error('x')), remove)).rejects.toThrow('x');
    expect(remove).not.toHaveBeenCalled();
  });

  it('still reports the original error when the clean-up fails too', async () => {
    const failure = new Error('database is down');
    const remove = vi.fn(async () => Promise.reject(new Error('storage is down')));
    await expect(writeWithImage('w/1/a.jpg', async () => Promise.reject(failure), remove)).rejects.toBe(failure);
  });
});
