import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { POST_MESSAGE } from 'src/constants/post-message.constant';
import { User } from 'src/user/entities/user.entity';
import { AwsService } from 'src/aws/aws.service';
import { PostImage } from './entities/post-image.entity';
// import { Category } from './types/postCategory.type';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(PostImage)
    private readonly postImageRepository: Repository<PostImage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly awsService: AwsService
  ) {}

  /* 게시글 생성 API*/
  async create(createPostDto: CreatePostDto, userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾지 못하였습니다.');
    }
    const createdPost = this.postRepository.create({
      ...createPostDto,
      userId,
    });

    const post = await this.postRepository.save(createdPost);
    return {
      id: post.id,
      userId: post.userId,
      nickname: user.nickname,
      title: post.title,
      category: post.category,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt, // 테스트를 위해 남겨둠 마무리에는 포스트아이디만 리턴할 예정
    };
  }
  /*게시글 목록 조회 API*/
  async findAll() {
    const posts = await this.postRepository.find({
      relations: ['user', 'comments'],
      order: { createdAt: 'DESC' }, // 최신순 정렬
    });
    return posts.map((post) => ({
      id: post.id,
      userId: post.userId,
      nickname: post.user.nickname,
      title: post.title,
      numComments: post.comments.length, // 댓글 수 배열로 표현됨
      category: post.category,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));
  }

  /* 게시글 상세 조회 API*/
  async findOne(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: [
        'user',
        'postImages',
        'comments',
        'postLikes',
        // 'postDislikes',
      ],
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return {
      id: post.id,
      userId: post.userId,
      nickname: post.user.nickname,
      title: post.title,
      images: post.postImages.map((image) => image.imgUrl), // 게시글 이미지 : { 이미지 URL}
      category: post.category,
      content: post.content,
      comments: post.comments, // 댓글
      numLikes: post.postLikes.length, // 좋아요 수
      // numDislikes: post.postDislikes.length, // 싫어요 수
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  /*화제글 목록 조회 API*/
  // [누적 좋아요]
  // /posts/hot
  // 화제글 목록 조회
  // 주석처리하고 지금 기준으로 일주일 좋아요 많은 순으로

  /*게시글 수정 API*/
  async update(id: number, updatePostDto: UpdatePostDto, userId: number) {
    const post = await this.postRepository.findOne({
      where: { id },
    });

    // 게시글이 존재하는지 확인
    if (!post) {
      throw new NotFoundException(POST_MESSAGE.POST.NOT_FOUND);
    }

    // 작성자 본인인지 확인
    if (post.userId !== userId) {
      throw new ForbiddenException('권한이 없습니다.');
    }
    await this.postRepository.update({ id }, updatePostDto);
    return await this.postRepository.findOneBy({ id });
  }

  /*게시글 삭제 API*/
  async remove(id: number, userId: number) {
    const post = await this.postRepository.findOne({
      where: { id },
    });

    // 게시글이 존재하는지 확인
    if (!post) {
      throw new NotFoundException(POST_MESSAGE.POST.NOT_FOUND);
    }

    // 작성자 본인인지 확인
    if (post.userId !== userId) {
      throw new ForbiddenException('권한이 없습니다.');
    }
    return this.postRepository.remove(post);
  }
  /** 이미지 업로드 API **/
  async uploadPostImage(id: number, file: Express.Multer.File) {
    const post = await this.postRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException(POST_MESSAGE.POST.NOT_FOUND);
    }
    const [fileName, fileExt] = file.originalname.split('.');
    const fileUrl = await this.awsService.imageUploadToS3(
      // 업로드
      `${Date.now()}_${fileName}`, // 이미지 이름과 URL이 같고 이미지는 다르게 되는 경우를 방지하고자 날짜를 넣음
      'posts',
      file,
      fileExt
    );
    // url db에 저장하는 코드 추가
    const postImage = this.postImageRepository.create({
      imgUrl: fileUrl,
      postId: post.id,
    });

    await this.postImageRepository.save(postImage);

    return fileUrl; // S3 URL 반환
  }
}
