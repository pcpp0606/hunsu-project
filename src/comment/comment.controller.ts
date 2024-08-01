import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import { LogIn } from 'src/decorators/log-in.decorator';
import { AuthGuard } from '@nestjs/passport';
import { COMMENT_MESSAGE } from 'src/constants/comment-message.constant';

@ApiTags('댓글 API')
@Controller('/posts/:postId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) { }

  /** 댓글 생성 **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '댓글 생성 API' })
  @ApiResponse({ status: HttpStatus.CREATED })
  @Post()
  async create(
    @LogIn() user: User,
    @Param('postId', ParseIntPipe) postId: number,
    @Body() createCommentDto: CreateCommentDto
  ) {
    const userId = user.id;

    const data = await this.commentService.createComment(
      userId,
      postId,
      createCommentDto
    );

    return {
      status: HttpStatus.CREATED,
      message: COMMENT_MESSAGE.COMMENT.CREATE.SUCCESS,
      data,
    };
  }

  /** 댓글 목록 조회 **/
  @ApiOperation({ summary: '댓글 목록 조회 API' })
  @Get()
  async findAll(
    @Param('postId', ParseIntPipe) postId: number
  ) {
    const data = await this.commentService.findCommentsByPostId(postId);

    return {
      status: HttpStatus.OK,
      message: COMMENT_MESSAGE.COMMENT.READ.SUCCESS,
      data,
    };
  }

  /** 댓글 수정**/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '댓글 수정 API' })
  @Patch(':commentId')
  async update(
    @LogIn() user: User,
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() updateCommentDto: UpdateCommentDto
  ) {
    const userId = user.id;

    const data = await this.commentService.update(
      userId,
      postId,
      commentId,
      updateCommentDto
    );

    return {
      status: HttpStatus.OK,
      message: COMMENT_MESSAGE.COMMENT.UPDATE.SUCCESS,
      data,
    };
  }

  /** 댓글 삭제 **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '댓글 삭제 API' })
  @Delete(':commentId')
  async remove(
    @LogIn() user: User,
    @Param('commentId', ParseIntPipe) commentId: number
  ) {
    const userId = user.id;
    await this.commentService.remove(userId, commentId);

    return {
      status: HttpStatus.OK,
      message: COMMENT_MESSAGE.COMMENT.DELETE.SUCCESS,
    };
  }

  /** 댓글 강제 삭제 **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '댓글 강제 삭제 API' })
  @Delete(':commentId/admin')
  async forceRemove(
    @LogIn() user: User,
    @Param('commentId', ParseIntPipe) commentId: number
  ) {
    const userId = user.id;
    await this.commentService.remove(userId, commentId);

    return {
      status: HttpStatus.OK,
      message: COMMENT_MESSAGE.COMMENT.FORCE_DELETE.SUCCESS,
    };
  }
}
